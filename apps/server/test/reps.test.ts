import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Rep } from '@dojo/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { testServer, type TestServer } from './helpers.js';

const REP_A: Rep = { id: 'a', card: 'react/keys', result: 'pass', at: '2026-10-01T10:00:00.000Z' };
const REP_B: Rep = { id: 'b', card: 'react/keys', result: 'fail', at: '2026-10-02T10:00:00.000Z' };

describe('rep routes', () => {
  let s: TestServer;
  beforeEach(async () => {
    s = await testServer();
  });
  afterEach(() => s.cleanup());

  it('starts empty when there is no log file', async () => {
    const response = await s.app.inject({ method: 'GET', url: '/api/reps' });

    expect(response.json()).toEqual({ reps: [] });
  });

  it('appends Reps once and reports a retried write as duplicates', async () => {
    const first = await s.app.inject({
      method: 'POST',
      url: '/api/reps',
      payload: { reps: [REP_A, REP_B] },
    });
    const retry = await s.app.inject({
      method: 'POST',
      url: '/api/reps',
      payload: { reps: [REP_B] },
    });

    expect(first.json()).toEqual({ accepted: ['a', 'b'], duplicates: [] });
    expect(retry.json()).toEqual({ accepted: [], duplicates: ['b'] });
    const file = await readFile(join(s.dataDir, 'reps.jsonl'), 'utf8');
    expect(file.trim().split('\n')).toHaveLength(2);
    expect((await s.app.inject({ method: 'GET', url: '/api/reps' })).json()).toEqual({
      reps: [REP_A, REP_B],
    });
  });

  it('accepts a Rep for a Card that does not exist: the log is history', async () => {
    const response = await s.app.inject({
      method: 'POST',
      url: '/api/reps',
      payload: { reps: [{ ...REP_A, card: 'gone/card' }] },
    });

    expect(response.json()).toEqual({ accepted: ['a'], duplicates: [] });
  });

  it('rejects a malformed Rep with 400 and writes nothing', async () => {
    const response = await s.app.inject({
      method: 'POST',
      url: '/api/reps',
      payload: { reps: [{ ...REP_A, result: 'meh' }] },
    });

    expect(response.statusCode).toBe(400);
    expect((await s.app.inject({ method: 'GET', url: '/api/reps' })).json()).toEqual({ reps: [] });
  });

  it('serializes concurrent appends so the same id lands once', async () => {
    const writes = Array.from({ length: 5 }, () =>
      s.app.inject({ method: 'POST', url: '/api/reps', payload: { reps: [REP_A] } }),
    );

    const results = await Promise.all(writes);

    const accepted = results.flatMap((r) => r.json().accepted as string[]);
    expect(accepted).toEqual(['a']);
  });

  it('reads a log seeded on disk', async () => {
    const seeded = await testServer({ reps: [REP_A] });

    expect((await seeded.app.inject({ method: 'GET', url: '/api/reps' })).json()).toEqual({
      reps: [REP_A],
    });
    await seeded.cleanup();
  });
});
