import { createStore, type Store } from '../../lib/store.js';
import type { DojoStore } from '../../store/dojo-store.js';
import { createKobzarClient, type KobzarClient, type KobzarHealth } from './kobzar-api.js';

export type KobzarAvailability =
  /** No address in the settings: no microphone button anywhere. */
  | { kind: 'absent' }
  /** The address is known, the first answer is pending. */
  | { kind: 'checking' }
  | { kind: 'ready'; client: KobzarClient; maxRecordingSeconds: number }
  /** `reason` is shown as the note under the button. */
  | { kind: 'unavailable'; reason: string };

export const KOBZAR_READY_POLL_MS = 60_000;
/** Faster while Kobzar is away, so the button comes back soon after Kobzar does. */
export const KOBZAR_UNAVAILABLE_POLL_MS = 10_000;

export const KOBZAR_STARTING_REASON = 'Kobzar is starting.';
export const KOBZAR_FAILED_REASON = "Kobzar's engine has failed; restart Kobzar.";
export const KOBZAR_UNREACHABLE_REASON = 'Kobzar is unreachable.';

export interface KobzarWatchOptions {
  readyPollMs?: number;
  unavailablePollMs?: number;
}

function availabilityOf(health: KobzarHealth, client: KobzarClient): KobzarAvailability {
  switch (health.status) {
    case 'ready':
      return { kind: 'ready', client, maxRecordingSeconds: health.maxRecordingSeconds };
    case 'loading':
      return { kind: 'unavailable', reason: KOBZAR_STARTING_REASON };
    case 'failed':
      return { kind: 'unavailable', reason: KOBZAR_FAILED_REASON };
  }
}

/** Whether a poll's answer says what the store already holds, so subscribers are not woken. */
function sameAvailability(a: KobzarAvailability, b: KobzarAvailability): boolean {
  if (a.kind === 'ready' && b.kind === 'ready') {
    return a.client === b.client && a.maxRecordingSeconds === b.maxRecordingSeconds;
  }
  if (a.kind === 'unavailable' && b.kind === 'unavailable') return a.reason === b.reason;
  return a.kind === b.kind;
}

/**
 * Knows, once for the whole Dojo, whether Kobzar can take a dictation: follows the address in
 * the Dojo's settings and asks Kobzar's health at start, when the page becomes visible again
 * and on a timer.
 */
export class KobzarWatch {
  readonly store: Store<KobzarAvailability> = createStore<KobzarAvailability>({ kind: 'absent' });
  private url: string | undefined;
  private client: KobzarClient | null = null;
  private running = false;
  private unsubscribe: (() => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight: AbortController | null = null;
  /** Grows with every check; an answer of an older check is ignored. */
  private generation = 0;
  private readonly readyPollMs: number;
  private readonly unavailablePollMs: number;

  constructor(
    private readonly dojo: DojoStore,
    options: KobzarWatchOptions = {},
  ) {
    this.readyPollMs = options.readyPollMs ?? KOBZAR_READY_POLL_MS;
    this.unavailablePollMs = options.unavailablePollMs ?? KOBZAR_UNAVAILABLE_POLL_MS;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.unsubscribe = this.dojo.subscribe(this.followAddress);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.followAddress();
  }

  stop(): void {
    this.running = false;
    this.unsubscribe?.();
    this.unsubscribe = null;
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.cancelPending();
    // Nothing is known while nobody watches; a later start() follows the address afresh.
    this.url = undefined;
    this.client = null;
    this.store.setState({ kind: 'absent' });
  }

  /** One check now. Never throws: the outcome is the state. */
  async check(): Promise<void> {
    const client = this.client;
    if (!this.running || !client) return;
    this.cancelPending();
    const generation = this.generation;
    const controller = new AbortController();
    this.inFlight = controller;
    let next: KobzarAvailability;
    try {
      next = availabilityOf(await client.health(controller.signal), client);
    } catch {
      // Whatever went wrong, the owner cannot dictate now; the next check may find Kobzar back.
      next = { kind: 'unavailable', reason: KOBZAR_UNREACHABLE_REASON };
    }
    if (generation !== this.generation) return;
    this.inFlight = null;
    if (!sameAvailability(this.store.getState(), next)) this.store.setState(next);
    this.timer = setTimeout(
      () => void this.check(),
      next.kind === 'ready' ? this.readyPollMs : this.unavailablePollMs,
    );
  }

  /** Drops the timer and the check in flight; whatever that check answers is ignored. */
  private cancelPending(): void {
    this.generation += 1;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.inFlight?.abort();
    this.inFlight = null;
  }

  private readonly followAddress = (): void => {
    const url = this.dojo.getState().settings?.kobzar?.url;
    if (url === this.url) return;
    this.url = url;
    if (url === undefined) {
      this.client = null;
      this.cancelPending();
      this.store.setState({ kind: 'absent' });
      return;
    }
    this.client = createKobzarClient(url);
    this.store.setState({ kind: 'checking' });
    void this.check();
  };

  private readonly onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') void this.check();
  };
}
