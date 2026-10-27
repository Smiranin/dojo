import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ContentSnapshot } from '@dojo/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { testServer, type TestServer } from './helpers.js';

describe('content routes', () => {
  let s: TestServer;
  beforeEach(async () => {
    s = await testServer();
  });
  afterEach(() => s.cleanup());

  it('serves the Katas and Cards of the folder and reports the broken files', async () => {
    const response = await s.app.inject({ method: 'GET', url: '/api/content' });

    expect(response.statusCode).toBe(200);
    const snapshot = response.json<ContentSnapshot>();
    expect(snapshot.katas.map((k) => k.id)).toEqual(['python', 'react']);
    expect(snapshot.cards.map((c) => c.id)).toEqual([
      'python/dunder-eq-hash',
      'python/gil',
      'react/context-rerender',
      'react/keys',
      'react/mystery-tag',
      'react/stale-closure',
      'react/use-memo',
    ]);
    expect(snapshot.issues).toEqual([
      { kind: 'unknown-tag', cardId: 'react/mystery-tag', tag: 'suspense' },
      { kind: 'missing-section', cardId: 'react/no-answer', section: 'Answer' },
    ]);
    expect(snapshot.revision).toMatch(/^[a-f0-9]{40}$/);
  });

  it('changes the revision when a file changes', async () => {
    const before = (
      await s.app.inject({ method: 'GET', url: '/api/content' })
    ).json<ContentSnapshot>();

    await s.app.inject({ method: 'PATCH', url: '/api/katas/react', payload: { pinned: false } });
    const after = (
      await s.app.inject({ method: 'GET', url: '/api/content' })
    ).json<ContentSnapshot>();

    expect(after.revision).not.toBe(before.revision);
  });

  it('flips only the flag and leaves the notes in kata.md untouched', async () => {
    const response = await s.app.inject({
      method: 'PATCH',
      url: '/api/katas/react',
      payload: { archived: true },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ id: 'react', pinned: true, archived: true });
    const file = await readFile(join(s.contentDir, 'react/kata.md'), 'utf8');
    expect(file).toContain('archived: true');
    expect(file).toContain('pinned: true');
    expect(file).toContain('Owner notes stay here and the Dojo ignores them.');
  });

  it('answers 404 for an unknown Kata and 400 for an empty patch', async () => {
    const unknown = await s.app.inject({
      method: 'PATCH',
      url: '/api/katas/nope',
      payload: { pinned: true },
    });
    const empty = await s.app.inject({ method: 'PATCH', url: '/api/katas/react', payload: {} });

    expect(unknown.statusCode).toBe(404);
    expect(unknown.json()).toMatchObject({ reason: 'not-found' });
    expect(empty.statusCode).toBe(400);
    expect(empty.json()).toMatchObject({ reason: 'invalid-body' });
  });

  it('deletes a Card file and keeps its Reps in the log', async () => {
    const rep = { id: 'r1', card: 'react/keys', result: 'pass', at: '2026-10-01T10:00:00.000Z' };
    await s.app.inject({ method: 'POST', url: '/api/reps', payload: { reps: [rep] } });

    const deleted = await s.app.inject({ method: 'DELETE', url: '/api/cards/react/keys' });
    const again = await s.app.inject({ method: 'DELETE', url: '/api/cards/react/keys' });
    const snapshot = (
      await s.app.inject({ method: 'GET', url: '/api/content' })
    ).json<ContentSnapshot>();
    const reps = (await s.app.inject({ method: 'GET', url: '/api/reps' })).json();

    expect(deleted.statusCode).toBe(204);
    expect(again.statusCode).toBe(404);
    expect(snapshot.cards.map((c) => c.id)).not.toContain('react/keys');
    expect(reps).toEqual({ reps: [rep] });
  });

  it('reports a folder without kata.md as an issue instead of failing the snapshot', async () => {
    const server = await testServer({
      content: [{ path: 'orphan/some-card.md', text: '---\n---\n## Question\nQ\n## Answer\nA\n' }],
    });

    const snapshot = (
      await server.app.inject({ method: 'GET', url: '/api/content' })
    ).json<ContentSnapshot>();

    expect(snapshot.katas).toEqual([]);
    expect(snapshot.issues).toEqual([
      { kind: 'invalid-kata', kataId: 'orphan', message: 'No kata.md in the folder' },
    ]);
    await server.cleanup();
  });
});
