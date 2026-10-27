import type { AuthorInput, Card, Kata } from '@dojo/core';
import { describe, expect, it } from 'vitest';
import { authorPrompt, chatPrompt, checkPrompt } from '../src/prompts.js';

const card: Card = {
  id: 'react/keys',
  kataId: 'react',
  slug: 'keys',
  question: 'Why keys?',
  answer: 'Identity across renders.',
  explanation: 'Reconciliation matches by key.',
  tags: ['rendering'],
};
const kata: Kata = {
  id: 'react',
  title: 'React',
  description: 'UI',
  tags: ['hooks', 'rendering'],
  pinned: false,
  archived: false,
};

describe('prompts', () => {
  it('puts the whole Card and the learner answer in the check prompt', () => {
    const prompt = checkPrompt({ card, answer: 'so React knows which is which' });

    expect(prompt).toContain('## Question\n\nWhy keys?');
    expect(prompt).toContain('## Explanation\n\nReconciliation matches by key.');
    expect(prompt).toContain("# Learner's answer\n\nso React knows which is which");
  });

  it('renders the conversation in order for a chat', () => {
    const prompt = chatPrompt({
      card,
      history: [
        { role: 'learner', text: 'Why not index?' },
        { role: 'sensei', text: 'Because order changes.' },
      ],
      message: 'And for static lists?',
    });

    expect(prompt.indexOf('**Learner:** Why not index?')).toBeLessThan(
      prompt.indexOf('**Sensei:** Because order changes.'),
    );
    expect(prompt).toContain("# Learner's message\n\nAnd for static lists?");
  });

  it('lists the allowed Tags, the existing questions and the target for a fix', () => {
    const input: AuthorInput = {
      kind: 'fix-card',
      instruction: 'Mention stable identity.',
      kata,
      existingQuestions: ['Why keys?', 'What is a hook?'],
      target: card,
    };

    const prompt = authorPrompt(input);

    expect(prompt).toContain('Allowed Tags: hooks, rendering');
    expect(prompt).toContain('- What is a hook?');
    expect(prompt).toContain('# Card to fix (slug: keys)');
    expect(prompt).toContain('Mention stable identity.');
  });
});
