import type { InboxNote, Rep } from '@dojo/core';
import { HttpError, NetworkError, type DojoApi } from '../api/client.js';
import type { DojoStore, PendingWrite } from './dojo-store.js';

/** A failed write is retried this many times in the sitting, then waits for Retry or reconnect. */
export const WRITE_RETRY_ATTEMPTS = 3;
export const WRITE_RETRY_DELAYS_MS = [500, 2_000, 5_000];
/** While the server is unreachable the whole state is refetched at this pace. */
export const RECONNECT_POLL_MS = 10_000;
export const HEALTH_POLL_MS = 60_000;

export type Slice = 'content' | 'settings' | 'reps' | 'inbox';
const SLICES: Slice[] = ['content', 'settings', 'reps', 'inbox'];

/** The subset of `EventSource` the sync uses, so tests can drive a fake. */
export interface EventSourceLike {
  addEventListener(type: string, listener: () => void): void;
  close(): void;
}

export interface SyncOptions {
  api: DojoApi;
  /** `null` disables the live stream (tests without SSE). */
  createEventSource: (url: string) => EventSourceLike | null;
  retryDelaysMs?: number[];
  reconnectPollMs?: number;
  healthPollMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

export const EVENTS_URL = '/api/events';

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Keeps the store a replica of the server: fetches every slice on start and on each change
 * event, sends writes in order with retries, and tracks whether the server is reachable.
 */
export class SyncClient {
  private source: EventSourceLike | null = null;
  private flushing: Promise<void> | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private healthTimer: ReturnType<typeof setInterval> | null = null;
  private stopped = false;
  private readonly delays: number[];
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(
    private readonly store: DojoStore,
    private readonly options: SyncOptions,
  ) {
    this.delays = options.retryDelaysMs ?? WRITE_RETRY_DELAYS_MS;
    this.sleep = options.sleep ?? defaultSleep;
  }

  async start(): Promise<void> {
    this.stopped = false;
    await this.refetchAll();
    this.store.setState((s) => ({ ...s, loaded: true }));
    this.connect();
    void this.refreshHealth();
    this.pollTimer = setInterval(() => {
      if (this.store.getState().connection === 'offline') void this.refetchAll();
    }, this.options.reconnectPollMs ?? RECONNECT_POLL_MS);
    this.healthTimer = setInterval(
      () => void this.refreshHealth(),
      this.options.healthPollMs ?? HEALTH_POLL_MS,
    );
  }

  stop(): void {
    this.stopped = true;
    this.source?.close();
    this.source = null;
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.healthTimer) clearInterval(this.healthTimer);
  }

  private connect(): void {
    const source = this.options.createEventSource(EVENTS_URL);
    if (!source) return;
    this.source = source;
    source.addEventListener('open', () => {
      // A (re)connect means the server is back: refetch everything and push what is pending.
      void this.refetchAll().then(() => this.flush());
    });
    source.addEventListener('error', () => this.setConnection('offline'));
    source.addEventListener('content.changed', () => void this.refetch('content'));
    source.addEventListener('reps.changed', () => void this.refetch('reps'));
    source.addEventListener('inbox.changed', () => void this.refetch('inbox'));
  }

  async refetchAll(): Promise<void> {
    await Promise.all(SLICES.map((slice) => this.refetch(slice)));
  }

  async refetch(slice: Slice): Promise<void> {
    try {
      switch (slice) {
        case 'content': {
          const snapshot = await this.options.api.content();
          this.store.setState((s) => ({ ...s, snapshot }));
          break;
        }
        case 'settings': {
          const settings = await this.options.api.settings();
          this.store.setState((s) => ({ ...s, settings }));
          break;
        }
        case 'reps': {
          const { reps } = await this.options.api.reps();
          this.store.setState((s) => ({ ...s, reps }));
          break;
        }
        case 'inbox': {
          const { notes } = await this.options.api.inbox();
          this.store.setState((s) => ({ ...s, inbox: notes }));
          break;
        }
      }
      this.setConnection('online');
    } catch (error) {
      if (error instanceof NetworkError) this.setConnection('offline');
      else throw error;
    }
  }

  async refreshHealth(): Promise<void> {
    try {
      const health = await this.options.api.health();
      this.store.setState((s) => ({ ...s, senseiHealth: health.sensei }));
      this.setConnection('online');
    } catch (error) {
      if (error instanceof NetworkError) this.setConnection('offline');
      else throw error;
    }
  }

  /** Adds a Rep to the pending writes; it counts for Due at once and is sent in order. */
  writeRep(rep: Rep): Promise<void> {
    return this.enqueue({ kind: 'rep', rep, attempts: 0 });
  }

  writeInboxAdd(note: InboxNote): Promise<void> {
    return this.enqueue({ kind: 'inbox-add', note, attempts: 0 });
  }

  writeInboxRemove(id: string): Promise<void> {
    return this.enqueue({ kind: 'inbox-remove', id, attempts: 0 });
  }

  private enqueue(item: PendingWrite): Promise<void> {
    this.store.setState((s) => ({ ...s, pendingWrites: [...s.pendingWrites, item] }));
    return this.flush();
  }

  /** Sends pending writes in order; one flush at a time, a second call joins the running one. */
  flush(): Promise<void> {
    if (this.flushing) return this.flushing;
    this.flushing = this.flushNow().finally(() => {
      this.flushing = null;
    });
    return this.flushing;
  }

  private async flushNow(): Promise<void> {
    while (!this.stopped) {
      const item = this.store.getState().pendingWrites[0];
      if (!item) return;
      try {
        await this.send(item);
      } catch (error) {
        if (error instanceof NetworkError) {
          const attempts = item.attempts + 1;
          this.replaceHead({ ...item, attempts } as PendingWrite);
          this.setConnection('offline');
          if (attempts >= WRITE_RETRY_ATTEMPTS) return;
          await this.sleep(this.delays[Math.min(attempts - 1, this.delays.length - 1)] ?? 0);
          continue;
        }
        // The server refused the write: retrying would not help, so drop it and say so.
        const message = error instanceof HttpError ? error.message : String(error);
        this.store.setState((s) => ({
          ...s,
          pendingWrites: s.pendingWrites.slice(1),
          lastWriteError: message,
        }));
        continue;
      }
      this.store.setState((s) => ({ ...s, pendingWrites: s.pendingWrites.slice(1) }));
      this.setConnection('online');
    }
  }

  private replaceHead(item: PendingWrite): void {
    this.store.setState((s) => ({ ...s, pendingWrites: [item, ...s.pendingWrites.slice(1)] }));
  }

  private async send(item: PendingWrite): Promise<void> {
    switch (item.kind) {
      case 'rep': {
        // A duplicate means an earlier attempt did land; either way the Rep is on the server.
        await this.options.api.postReps([item.rep]);
        this.store.setState((s) => ({
          ...s,
          reps: s.reps.some((r) => r.id === item.rep.id) ? s.reps : [...s.reps, item.rep],
        }));
        return;
      }
      case 'inbox-add': {
        await this.options.api.postInbox(item.note);
        this.store.setState((s) => ({
          ...s,
          inbox: s.inbox.some((n) => n.id === item.note.id) ? s.inbox : [...s.inbox, item.note],
        }));
        return;
      }
      case 'inbox-remove':
        await this.options.api.deleteInbox(item.id);
        this.store.setState((s) => ({ ...s, inbox: s.inbox.filter((n) => n.id !== item.id) }));
        return;
    }
  }

  clearWriteError(): void {
    this.store.setState((s) => ({ ...s, lastWriteError: null }));
  }

  private setConnection(connection: 'online' | 'offline'): void {
    this.store.setState((s) => (s.connection === connection ? s : { ...s, connection }));
  }
}
