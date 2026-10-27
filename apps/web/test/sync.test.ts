import type { Rep } from '@dojo/core';
import { describe, expect, it } from 'vitest';
import { NetworkError, HttpError, type DojoApi } from '../src/api/client.js';
import { createDojoStore } from '../src/store/dojo-store.js';
import { effectiveReps } from '../src/store/derive.js';
import { SyncClient, WRITE_RETRY_ATTEMPTS } from '../src/store/sync.js';

const rep = (id: string): Rep => ({
  id,
  card: 'react/keys',
  result: 'pass',
  at: '2026-10-01T10:00:00.000Z',
});

/** An api whose postReps fails `failures` times with a NetworkError, then succeeds. */
function apiWith(plan: { failures?: number; refuse?: boolean } = {}) {
  let failures = plan.failures ?? 0;
  const posted: Rep[][] = [];
  const api = {
    postReps: async (reps: Rep[]) => {
      if (plan.refuse) throw new HttpError(400, { reason: 'invalid-body', message: 'bad rep' });
      if (failures > 0) {
        failures -= 1;
        throw new NetworkError(new Error('ECONNREFUSED'));
      }
      posted.push(reps);
      return { accepted: reps.map((r) => r.id), duplicates: [] };
    },
    content: async () => ({ revision: '1', katas: [], cards: [], issues: [] }),
    settings: async () => {
      throw new NetworkError(new Error('down'));
    },
    reps: async () => ({ reps: [] }),
    inbox: async () => ({ notes: [] }),
    health: async () => ({
      ok: true as const,
      sensei: { ok: true as const },
      contentDir: '',
      version: 't',
    }),
  } as unknown as DojoApi;
  return { api, posted };
}

function client(api: DojoApi) {
  const store = createDojoStore();
  const sync = new SyncClient(store, {
    api,
    createEventSource: () => null,
    retryDelaysMs: [0, 0, 0],
    sleep: async () => {},
  });
  return { store, sync };
}

describe('writeWithRetry', () => {
  it('retries a network failure and keeps the Rep counting meanwhile', async () => {
    const { api, posted } = apiWith({ failures: 2 });
    const { store, sync } = client(api);

    const done = sync.writeRep(rep('a'));
    expect(effectiveReps(store.getState()).map((r) => r.id)).toEqual(['a']);
    await done;

    expect(posted).toEqual([[rep('a')]]);
    expect(store.getState().pendingWrites).toEqual([]);
    expect(store.getState().reps.map((r) => r.id)).toEqual(['a']);
    expect(store.getState().connection).toBe('online');
  });

  it('gives up after the retry budget, marks the server offline and resumes on flush', async () => {
    const { api, posted } = apiWith({ failures: WRITE_RETRY_ATTEMPTS });
    const { store, sync } = client(api);

    await sync.writeRep(rep('a'));

    expect(posted).toEqual([]);
    expect(store.getState().pendingWrites).toMatchObject([
      { kind: 'rep', attempts: WRITE_RETRY_ATTEMPTS },
    ]);
    expect(store.getState().connection).toBe('offline');

    await sync.flush();

    expect(posted).toEqual([[rep('a')]]);
    expect(store.getState().pendingWrites).toEqual([]);
  });

  it('sends writes in the order they were made, one request each', async () => {
    const { api, posted } = apiWith({ failures: 1 });
    const { sync } = client(api);

    await Promise.all([sync.writeRep(rep('a')), sync.writeRep(rep('b')), sync.writeRep(rep('c'))]);

    expect(posted.map((batch) => batch.map((r) => r.id))).toEqual([['a'], ['b'], ['c']]);
  });

  it('drops a write the server refuses and reports it instead of retrying', async () => {
    const { api } = apiWith({ refuse: true });
    const { store, sync } = client(api);

    await sync.writeRep(rep('a'));

    expect(store.getState().pendingWrites).toEqual([]);
    expect(store.getState().lastWriteError).toBe('bad rep');
  });

  it('marks the server offline when a slice cannot be fetched and online when one can', async () => {
    const { api } = apiWith();
    const { store, sync } = client(api);

    await sync.refetch('settings');
    expect(store.getState().connection).toBe('offline');

    await sync.refetch('content');
    expect(store.getState().connection).toBe('online');
  });
});
