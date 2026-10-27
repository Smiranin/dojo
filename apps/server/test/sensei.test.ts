import { SenseiError } from '@dojo/core';
import { FakeSensei } from '@dojo/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { testServer, type TestServer } from './helpers.js';

describe('sensei check and chat', () => {
  let s: TestServer;
  let sensei: FakeSensei;
  beforeEach(async () => {
    sensei = new FakeSensei();
    s = await testServer({ sensei });
  });
  afterEach(() => s.cleanup());

  it('grades an answer against the Card on disk and returns the Result with notes', async () => {
    sensei.scriptCheck({ result: 'pass-with-notes', notes: '- mention referential stability' });

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/check',
      payload: { cardId: 'react/use-memo', answer: 'when the computation is expensive' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      result: 'pass-with-notes',
      notes: '- mention referential stability',
    });
    expect(sensei.calls).toHaveLength(1);
    const call = sensei.calls[0]!;
    expect(call.method).toBe('check');
    expect(call.method === 'check' && call.input.card.id).toBe('react/use-memo');
    expect(call.method === 'check' && call.input.card.answer).toContain('expensive');
  });

  it('answers 503 with the reason when the Sensei is unavailable', async () => {
    sensei.scriptCheck(new SenseiError('unavailable', 'not logged in'));

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/check',
      payload: { cardId: 'react/use-memo', answer: 'x' },
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ reason: 'sensei-unavailable', message: 'not logged in' });
  });

  it('answers 504 on a timeout and 502 on an answer that did not match the schema', async () => {
    sensei.scriptCheck(
      new SenseiError('timeout', 'too slow'),
      new SenseiError('invalid-output', 'bad json'),
    );
    const payload = { cardId: 'react/use-memo', answer: 'x' };

    const timeout = await s.app.inject({ method: 'POST', url: '/api/sensei/check', payload });
    const invalid = await s.app.inject({ method: 'POST', url: '/api/sensei/check', payload });

    expect(timeout.statusCode).toBe(504);
    expect(invalid.statusCode).toBe(502);
  });

  it('refuses an unknown Card with 404 before calling the Sensei', async () => {
    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/check',
      payload: { cardId: 'react/nope', answer: 'x' },
    });

    expect(response.statusCode).toBe(404);
    expect(sensei.calls).toEqual([]);
  });

  it('passes the whole history to a chat and returns the reply', async () => {
    sensei.scriptChat({ reply: 'Because order can change.' });
    const history = [{ role: 'learner', text: 'Why not the index?' }];

    const response = await s.app.inject({
      method: 'POST',
      url: '/api/sensei/chat',
      payload: { cardId: 'react/keys', history, message: 'Really?' },
    });

    expect(response.json()).toEqual({ reply: 'Because order can change.' });
    const call = sensei.calls[0]!;
    expect(call.method === 'chat' && call.input.history).toEqual(history);
    expect(call.method === 'chat' && call.input.message).toBe('Really?');
  });
});
