import { RESULTS, type Card, type Kata } from '@dojo/core';
import { describe, expect, it } from 'vitest';
import { ClaudeSensei } from '../src/claude-sensei.js';

const LIVE_TIMEOUT_MS = 300_000;
const CYRILLIC = /[а-яё]/i;

const card: Card = {
  id: 'react/keys',
  kataId: 'react',
  slug: 'keys',
  question: 'Why must list items in React have stable keys?',
  answer:
    'Keys let React match elements between renders so component state and DOM nodes follow the item instead of its position; index keys break when the list is reordered or filtered.',
  tags: ['rendering'],
};
const kata: Kata = {
  id: 'react',
  title: 'React',
  description: 'Hooks, rendering and state for a React interview.',
  tags: ['hooks', 'rendering'],
  pinned: false,
  archived: false,
};

/** Runs only with DOJO_LIVE=1: talks to the real Sensei on the Claude Code login. */
describe.skipIf(process.env.DOJO_LIVE !== '1')('ClaudeSensei (live)', () => {
  const sensei = new ClaudeSensei({ timeoutMs: LIVE_TIMEOUT_MS });

  it('reports healthy', { timeout: LIVE_TIMEOUT_MS }, async () => {
    expect(await sensei.healthCheck()).toEqual({ ok: true });
  });

  it('grades a Kumite and returns a Result with notes', { timeout: LIVE_TIMEOUT_MS }, async () => {
    const output = await sensei.kumite({
      card,
      kumite:
        'So React can track which item is which between renders and keep state attached to it.',
    });

    expect(RESULTS).toContain(output.result);
    expect(typeof output.notes).toBe('string');
  });

  it('writes the notes on a Russian Kumite in Russian', { timeout: LIVE_TIMEOUT_MS }, async () => {
    const output = await sensei.kumite({ card, kumite: 'Чтобы React быстрее рендерил список.' });

    expect(output.notes).toMatch(CYRILLIC);
  });

  it('replies to a Russian message in Russian', { timeout: LIVE_TIMEOUT_MS }, async () => {
    const output = await sensei.chat({
      card,
      chat: { opening: { kind: 'self-graded', choice: 'dont-know' }, turns: [] },
      message: 'Почему нельзя использовать индекс как ключ?',
    });

    expect(output.reply).toMatch(CYRILLIC);
  });

  it(
    'writes Cards of an English Kata in English when asked in Russian',
    { timeout: LIVE_TIMEOUT_MS },
    async () => {
      const proposal = await sensei.author({
        kind: 'add-cards',
        instruction: 'Добавь одну карточку про useEffect cleanup',
        kata,
        existingQuestions: [card.question],
      });

      expect(proposal.cards.length).toBeGreaterThan(0);
      for (const proposed of proposal.cards) expect(proposed.question).not.toMatch(CYRILLIC);
    },
  );
});
