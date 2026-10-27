import { FakeSensei } from '@dojo/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { testServer, type TestServer } from './helpers.js';

describe('health and settings', () => {
  let s: TestServer;
  afterEach(() => s.cleanup());

  it('reports the Sensei health, the content dir and the version', async () => {
    s = await testServer();

    const response = await s.app.inject({ method: 'GET', url: '/api/health' });

    expect(response.json()).toEqual({
      ok: true,
      sensei: { ok: true },
      contentDir: s.contentDir,
      version: 'test',
    });
  });

  it('caches the Sensei health instead of asking on every request', async () => {
    const sensei = new FakeSensei();
    sensei.health = { ok: false, reason: 'not logged in' };
    s = await testServer({ sensei, healthTtlMs: 60_000 });

    const first = await s.app.inject({ method: 'GET', url: '/api/health' });
    sensei.health = { ok: true };
    const second = await s.app.inject({ method: 'GET', url: '/api/health' });

    expect(first.json().sensei).toEqual({ ok: false, reason: 'not logged in' });
    expect(second.json().sensei).toEqual({ ok: false, reason: 'not logged in' });
  });

  it('serves the scheduling settings the web derives with', async () => {
    s = await testServer();

    const response = await s.app.inject({ method: 'GET', url: '/api/settings' });

    expect(response.json()).toMatchObject({ scheduling: { firstPassDays: 7, knownDays: 21 } });
  });
});
