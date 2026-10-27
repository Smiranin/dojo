import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { AuthoringProposal } from '@dojo/core';
import { FakeSensei } from '@dojo/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { testServer, type TestServer } from './helpers.js';

const proposedCard = {
  slug: 'server-components',
  question: 'What runs where with React Server Components?',
  answer: 'Server Components render on the server and never ship their code to the client.',
  explanation: 'The RSC payload describes the tree.',
  tags: ['rendering', 'suspense'],
  difficulty: 'medium' as const,
};

async function listCards(s: TestServer): Promise<string[]> {
  const snapshot = (await s.app.inject({ method: 'GET', url: '/api/content' })).json<{
    cards: { id: string }[];
  }>();
  return snapshot.cards.map((c) => c.id);
}

describe('POST /api/sensei/author', () => {
  let s: TestServer;
  let sensei: FakeSensei;
  beforeEach(async () => {
    sensei = new FakeSensei();
    s = await testServer({ sensei });
  });
  afterEach(() => s.cleanup());

  it('adds Cards to a Kata, drops unknown Tags and leaves kata.md untouched', async () => {
    const kataPath = join(s.contentDir, 'react/kata.md');
    const before = await stat(kataPath);
    sensei.scriptAuthor({ cards: [proposedCard] });

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/author',
      payload: { kind: 'add-cards', instruction: 'add a card about RSC', kataId: 'react' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      kataId: 'react',
      cards: ['react/server-components'],
      issues: ['Tag "suspense" is not in the Kata and was dropped'],
    });
    const file = await readFile(join(s.contentDir, 'react/server-components.md'), 'utf8');
    expect(file).toContain('tags: [rendering]');
    expect(file).toContain('## Explanation');
    expect((await stat(kataPath)).mtimeMs).toBe(before.mtimeMs);
    expect(await listCards(s)).toContain('react/server-components');
    const call = sensei.calls[0]!;
    expect(call.method === 'author' && call.input.existingQuestions).toContain(
      'Why must list items have stable keys?',
    );
  });

  it('creates a new Kata with its folder, kata.md and first Cards', async () => {
    const proposal: AuthoringProposal = {
      kata: {
        id: 'go',
        title: 'Go',
        description: 'Concurrency and the toolchain.',
        tags: ['channels'],
      },
      cards: [{ ...proposedCard, slug: 'channels', tags: ['channels', 'rendering'] }],
    };
    sensei.scriptAuthor(proposal);

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/author',
      payload: { kind: 'new-kata', instruction: 'Go: channels and goroutines' },
    });

    expect(response.json()).toMatchObject({ kataId: 'go', cards: ['go/channels'] });
    const kata = await readFile(join(s.contentDir, 'go/kata.md'), 'utf8');
    expect(kata).toContain('title: Go');
    expect(kata).toContain('tags: [channels]');
    expect(await readFile(join(s.contentDir, 'go/channels.md'), 'utf8')).toContain(
      'tags: [channels]',
    );
  });

  it('refuses a new Kata whose folder exists and writes nothing', async () => {
    sensei.scriptAuthor({
      kata: { id: 'react', title: 'React again', description: '', tags: [] },
      cards: [proposedCard],
    });

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/author',
      payload: { kind: 'new-kata', instruction: 'react' },
    });

    expect(response.statusCode).toBe(409);
    expect(await readFile(join(s.contentDir, 'react/kata.md'), 'utf8')).toContain('title: React\n');
    expect(await listCards(s)).not.toContain('react/server-components');
  });

  it('overwrites the target for a fix and keeps its slug', async () => {
    sensei.scriptAuthor({
      cards: [{ ...proposedCard, slug: 'whatever', question: 'Why stable keys?' }],
    });

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/author',
      payload: {
        kind: 'fix-card',
        instruction: 'shorter question',
        kataId: 'react',
        cardId: 'react/keys',
      },
    });

    expect(response.json()).toMatchObject({ cards: ['react/keys'] });
    expect(await readFile(join(s.contentDir, 'react/keys.md'), 'utf8')).toContain(
      'Why stable keys?',
    );
    expect(await listCards(s)).not.toContain('react/whatever');
  });

  it('gives a colliding slug a numeric suffix instead of overwriting', async () => {
    sensei.scriptAuthor({
      cards: [
        { ...proposedCard, slug: 'keys' },
        { ...proposedCard, slug: 'keys' },
      ],
    });

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/author',
      payload: { kind: 'add-cards', instruction: 'more', kataId: 'react' },
    });

    expect(response.json()).toMatchObject({ cards: ['react/keys-2', 'react/keys-3'] });
    expect(await readFile(join(s.contentDir, 'react/keys.md'), 'utf8')).toContain('stable keys');
  });

  it('answers 422 and writes nothing when the Sensei proposes no Cards', async () => {
    sensei.scriptAuthor({ cards: [] });
    const before = await listCards(s);

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/author',
      payload: { kind: 'add-cards', instruction: 'x', kataId: 'react' },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({ reason: 'proposal-rejected' });
    expect(await listCards(s)).toEqual(before);
  });

  it('hands an Inbox note and a chat to the Sensei as context', async () => {
    sensei.scriptAuthor({ cards: [proposedCard] });
    const context = { note: 'ask about RSC', chat: [{ role: 'learner', text: 'hi' }] };

    await s.app.inject({
      method: 'POST',
      url: '/api/sensei/author',
      payload: { kind: 'from-inbox', instruction: '', kataId: 'react', context },
    });

    const call = sensei.calls[0]!;
    expect(call.method === 'author' && call.input.context).toEqual(context);
  });

  it('answers 404 for an unknown Kata without calling the Sensei', async () => {
    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/author',
      payload: { kind: 'add-cards', instruction: 'x', kataId: 'nope' },
    });

    expect(response.statusCode).toBe(404);
    expect(sensei.calls).toEqual([]);
  });
});
