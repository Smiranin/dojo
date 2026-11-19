import { describe, expect, it } from 'vitest';
import { FakeSensei } from '../src/testing/index.js';
import type { Card, Chat } from '../src/index.js';

const card: Card = {
  id: 'react/a',
  kataId: 'react',
  slug: 'a',
  question: 'Q',
  answer: 'A',
  tags: [],
};
const know: Chat = { opening: { kind: 'self-graded', choice: 'know' }, turns: [] };

describe('FakeSensei', () => {
  it('answers from the scripted queue and records the call', async () => {
    const sensei = new FakeSensei().scriptKumite({ result: 'pass', notes: '' });

    const output = await sensei.kumite({ card, kumite: 'my answer' });

    expect(output).toEqual({ result: 'pass', notes: '' });
    expect(sensei.calls).toEqual([{ method: 'kumite', input: { card, kumite: 'my answer' } }]);
  });

  it('holds every call until released', async () => {
    const sensei = new FakeSensei().scriptChat({ reply: 'later' });
    const release = sensei.hold();
    let settled = false;

    const reply = sensei.chat({ card, chat: know, message: 'hi' }).then((output) => {
      settled = true;
      return output;
    });
    await Promise.resolve();
    expect(sensei.calls).toHaveLength(1);
    expect(settled).toBe(false);

    release();
    expect(await reply).toEqual({ reply: 'later' });
  });

  it('throws a scripted Error and fails loudly when nothing is scripted', async () => {
    const sensei = new FakeSensei().scriptChat(new Error('model down'));

    await expect(sensei.chat({ card, chat: know, message: 'hi' })).rejects.toThrow('model down');
    await expect(sensei.chat({ card, chat: know, message: 'hi' })).rejects.toThrow(
      'no scripted chat output',
    );
  });
});
