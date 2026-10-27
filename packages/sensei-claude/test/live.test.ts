import { RESULTS, type Card } from '@dojo/core';
import { describe, expect, it } from 'vitest';
import { ClaudeSensei } from '../src/claude-sensei.js';

const LIVE_TIMEOUT_MS = 300_000;

const card: Card = {
  id: 'react/keys',
  kataId: 'react',
  slug: 'keys',
  question: 'Why must list items in React have stable keys?',
  answer:
    'Keys let React match elements between renders so component state and DOM nodes follow the item instead of its position; index keys break when the list is reordered or filtered.',
  tags: ['rendering'],
};

/** Runs only with DOJO_LIVE=1: talks to the real Sensei on the Claude Code login. */
describe.skipIf(process.env.DOJO_LIVE !== '1')('ClaudeSensei (live)', () => {
  const sensei = new ClaudeSensei({ timeoutMs: LIVE_TIMEOUT_MS });

  it('reports healthy', { timeout: LIVE_TIMEOUT_MS }, async () => {
    expect(await sensei.healthCheck()).toEqual({ ok: true });
  });

  it('checks an answer and returns a Result with notes', { timeout: LIVE_TIMEOUT_MS }, async () => {
    const output = await sensei.check({
      card,
      answer:
        'So React can track which item is which between renders and keep state attached to it.',
    });

    expect(RESULTS).toContain(output.result);
    expect(typeof output.notes).toBe('string');
  });
});
