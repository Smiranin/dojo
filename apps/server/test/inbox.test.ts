import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { testServer, type TestServer } from './helpers.js';

const NOTE = { id: 'n1', text: 'Ask about Suspense', at: '2026-10-01T10:00:00.000Z' };

describe('inbox routes', () => {
  let s: TestServer;
  beforeEach(async () => {
    s = await testServer();
  });
  afterEach(() => s.cleanup());

  it('adds a note once, even when the write is retried', async () => {
    await s.app.inject({ method: 'POST', url: '/api/inbox', payload: NOTE });
    const retry = await s.app.inject({ method: 'POST', url: '/api/inbox', payload: NOTE });

    expect(retry.statusCode).toBe(200);
    expect((await s.app.inject({ method: 'GET', url: '/api/inbox' })).json()).toEqual({
      notes: [NOTE],
    });
    const file = JSON.parse(await readFile(join(s.dataDir, 'inbox.json'), 'utf8'));
    expect(file.notes).toHaveLength(1);
  });

  it('removes a note and answers 204 again for a note already gone', async () => {
    await s.app.inject({ method: 'POST', url: '/api/inbox', payload: NOTE });

    const removed = await s.app.inject({ method: 'DELETE', url: '/api/inbox/n1' });
    const again = await s.app.inject({ method: 'DELETE', url: '/api/inbox/n1' });

    expect(removed.statusCode).toBe(204);
    expect(again.statusCode).toBe(204);
    expect((await s.app.inject({ method: 'GET', url: '/api/inbox' })).json()).toEqual({
      notes: [],
    });
  });

  it('rejects an empty note', async () => {
    const response = await s.app.inject({
      method: 'POST',
      url: '/api/inbox',
      payload: { ...NOTE, text: '' },
    });

    expect(response.statusCode).toBe(400);
  });
});
