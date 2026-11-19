import { SenseiError } from '@dojo/core';
import { FakeSensei } from '@dojo/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listenOnLoopback, testServer, type TestServer } from './helpers.js';

const KNOW = { opening: { kind: 'self-graded', choice: 'know' }, turns: [] };

describe('sensei kumite and chat', () => {
  let s: TestServer;
  let sensei: FakeSensei;
  beforeEach(async () => {
    sensei = new FakeSensei();
    s = await testServer({ sensei });
  });
  afterEach(() => s.cleanup());

  it('grades a Kumite against the Card on disk and returns the Result with notes', async () => {
    sensei.scriptKumite({ result: 'pass-with-notes', notes: '- mention referential stability' });

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/kumite',
      payload: { cardId: 'react/use-memo', kumite: 'when the computation is expensive' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      result: 'pass-with-notes',
      notes: '- mention referential stability',
    });
    expect(sensei.calls).toHaveLength(1);
    const call = sensei.calls[0]!;
    expect(call.method).toBe('kumite');
    expect(call.method === 'kumite' && call.input.card.id).toBe('react/use-memo');
    expect(call.method === 'kumite' && call.input.card.answer).toContain('expensive');
    expect(call.method === 'kumite' && call.input.kumite).toBe('when the computation is expensive');
  });

  it('answers 503 with the reason when the Sensei is unavailable', async () => {
    sensei.scriptKumite(new SenseiError('unavailable', 'not logged in'));

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/kumite',
      payload: { cardId: 'react/use-memo', kumite: 'x' },
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ reason: 'sensei-unavailable', message: 'not logged in' });
  });

  it('answers 504 on a timeout and 502 on an answer that did not match the schema', async () => {
    sensei.scriptKumite(
      new SenseiError('timeout', 'too slow'),
      new SenseiError('invalid-output', 'bad json'),
    );
    const payload = { cardId: 'react/use-memo', kumite: 'x' };

    const timeout = await s.app.inject({ method: 'POST', url: '/api/sensei/kumite', payload });
    const invalid = await s.app.inject({ method: 'POST', url: '/api/sensei/kumite', payload });

    expect(timeout.statusCode).toBe(504);
    expect(invalid.statusCode).toBe(502);
  });

  it('refuses an unknown Card with 404 before calling the Sensei', async () => {
    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/kumite',
      payload: { cardId: 'react/nope', kumite: 'x' },
    });

    expect(response.statusCode).toBe(404);
    expect(sensei.calls).toEqual([]);
  });

  it('passes the whole Chat with its opening to the Sensei and returns the reply', async () => {
    sensei.scriptChat({ reply: 'Because order can change.' });
    const chat = {
      opening: { kind: 'kumite', kumite: 'by index', result: 'fail', notes: '- not the index' },
      turns: [
        { role: 'learner', text: 'Why not the index?' },
        { role: 'sensei', text: 'Order changes.' },
      ],
    };

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/chat',
      payload: { cardId: 'react/keys', chat, message: 'Really?' },
    });

    expect(response.json()).toEqual({ reply: 'Because order can change.' });
    const call = sensei.calls[0]!;
    expect(call.method === 'chat' && call.input.chat).toEqual(chat);
    expect(call.method === 'chat' && call.input.message).toBe('Really?');
  });

  it('refuses a chat that sends a bare history instead of a Chat', async () => {
    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/chat',
      payload: { cardId: 'react/keys', history: [], message: 'Really?' },
    });

    expect(response.statusCode).toBe(400);
    expect(sensei.calls).toEqual([]);
  });
});

describe('a Sensei request the learner leaves', () => {
  let s: TestServer;
  let sensei: FakeSensei;
  let base: string;
  beforeEach(async () => {
    sensei = new FakeSensei();
    s = await testServer({ sensei });
    base = await listenOnLoopback(s);
  });
  afterEach(() => s.cleanup());

  it('aborts the Sensei when the client goes away before the reply', async () => {
    const release = sensei.hold();
    sensei.scriptChat({ reply: 'Nobody reads this.' });
    const client = new AbortController();

    const request = fetch(`${base}/api/sensei/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cardId: 'react/keys', chat: KNOW, message: 'Why?' }),
      signal: client.signal,
    });
    await vi.waitFor(() => expect(sensei.calls).toHaveLength(1));
    client.abort();
    await expect(request).rejects.toThrow();

    const call = sensei.calls[0]!;
    await vi.waitFor(() => expect(call.method === 'chat' && call.input.signal?.aborted).toBe(true));
    release();
  });

  it('leaves the signal alone when the reply was sent', async () => {
    sensei.scriptKumite({ result: 'pass', notes: '' });

    const response = await fetch(`${base}/api/sensei/kumite`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cardId: 'react/keys', kumite: 'identity' }),
    });
    expect(await response.json()).toEqual({ result: 'pass', notes: '' });
    // Let the socket's close events run before looking at the signal.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const call = sensei.calls[0]!;
    expect(call.method === 'kumite' && call.input.signal?.aborted).toBe(false);
  });
});
