import { appendFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ContentSnapshot } from '@dojo/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { testServer, type TestServer } from './helpers.js';

/** Every stream opened by a test, aborted in afterEach so a failed test cannot hang cleanup. */
const openStreams = new Set<AbortController>();

/** Reads the SSE stream and resolves the names of the first `count` events. */
async function readEvents(
  url: string,
  count: number,
  timeoutMs = 5_000,
): Promise<{ names: string[]; close: () => void }> {
  const abort = new AbortController();
  openStreams.add(abort);
  const response = await fetch(url, { signal: abort.signal });
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  const names: string[] = [];
  let buffer = '';
  const deadline = Date.now() + timeoutMs;
  while (names.length < count) {
    if (Date.now() > deadline) throw new Error(`Timed out; got ${names.join(', ') || 'nothing'}`);
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('event: '));
      if (line) names.push(line.slice('event: '.length));
    }
  }
  return { names, close: () => abort.abort() };
}

const NEW_CARD = '---\ntags: [hooks]\n---\n\n## Question\n\nNew?\n\n## Answer\n\nYes.\n';

describe('GET /api/events', { timeout: 20_000 }, () => {
  let s: TestServer;
  let base: string;
  beforeEach(async () => {
    s = await testServer();
    await s.app.listen({ host: '127.0.0.1', port: 0 });
    const address = s.app.server.address();
    base = typeof address === 'object' && address ? `http://127.0.0.1:${address.port}` : '';
  });
  afterEach(async () => {
    for (const abort of openStreams) abort.abort();
    openStreams.clear();
    await s.cleanup();
  });

  it('announces a Card written on the laptop, and the next snapshot has it', async () => {
    const pending = readEvents(`${base}/api/events`, 1);
    await waitForClient(s);

    await writeFile(join(s.contentDir, 'react/new-card.md'), NEW_CARD);
    const { names, close } = await pending;
    close();

    expect(names).toEqual(['content.changed']);
    const snapshot = (await (await fetch(`${base}/api/content`)).json()) as ContentSnapshot;
    expect(snapshot.cards.map((c) => c.id)).toContain('react/new-card');
  });

  it('announces Reps appended by hand and Inbox edits as their own events', async () => {
    const first = readEvents(`${base}/api/events`, 1);
    await waitForClient(s);
    await appendFile(
      join(s.dataDir, 'reps.jsonl'),
      `${JSON.stringify({ id: 'h1', card: 'react/keys', result: 'pass', at: '2026-10-01T10:00:00.000Z' })}\n`,
    );
    const reps = await first;
    reps.close();

    const second = readEvents(`${base}/api/events`, 1);
    await waitForClient(s);
    await writeFile(join(s.dataDir, 'inbox.json'), JSON.stringify({ notes: [] }));
    const inbox = await second;
    inbox.close();

    expect(reps.names).toEqual(['reps.changed']);
    expect(inbox.names).toEqual(['inbox.changed']);
  });

  it('collapses a burst of writes into one event per slice', async () => {
    const pending = readEvents(`${base}/api/events`, 1);
    await waitForClient(s);

    for (let i = 0; i < 5; i += 1) {
      await writeFile(join(s.contentDir, `react/burst-${i}.md`), NEW_CARD);
    }
    const { names, close } = await pending;
    await new Promise((r) => setTimeout(r, 100));
    close();

    expect(names).toEqual(['content.changed']);
    expect(s.context.events.clientCount).toBe(1);
  });
});

async function waitForClient(s: TestServer): Promise<void> {
  const deadline = Date.now() + 2_000;
  while (s.context.events.clientCount === 0) {
    if (Date.now() > deadline) throw new Error('The SSE client never connected');
    await new Promise((r) => setTimeout(r, 5));
  }
}
