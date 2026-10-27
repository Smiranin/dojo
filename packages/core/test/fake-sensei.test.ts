import { describe, expect, it } from 'vitest';
import { FakeSensei } from '../src/testing/index.js';
import type { Card } from '../src/index.js';

const card: Card = {
  id: 'react/a',
  kataId: 'react',
  slug: 'a',
  question: 'Q',
  answer: 'A',
  tags: [],
};

describe('FakeSensei', () => {
  it('answers from the scripted queue and records the call', async () => {
    const sensei = new FakeSensei().scriptCheck({ result: 'pass', notes: '' });

    const output = await sensei.check({ card, answer: 'my answer' });

    expect(output).toEqual({ result: 'pass', notes: '' });
    expect(sensei.calls).toEqual([{ method: 'check', input: { card, answer: 'my answer' } }]);
  });

  it('throws a scripted Error and fails loudly when nothing is scripted', async () => {
    const sensei = new FakeSensei().scriptChat(new Error('model down'));

    await expect(sensei.chat({ card, history: [], message: 'hi' })).rejects.toThrow('model down');
    await expect(sensei.chat({ card, history: [], message: 'hi' })).rejects.toThrow(
      'no scripted chat output',
    );
  });
});
