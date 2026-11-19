import type { AuthorInput, Card, Chat, Kata } from '@dojo/core';
import { describe, expect, it } from 'vitest';
import {
  AUTHOR_SYSTEM_PROMPT,
  CHAT_SYSTEM_PROMPT,
  KATA_LANGUAGE_RULE,
  KUMITE_SYSTEM_PROMPT,
  REPLY_LANGUAGE_RULE,
  authorPrompt,
  chatPrompt,
  kumitePrompt,
} from '../src/prompts.js';

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
const afterKumite: Chat = {
  opening: {
    kind: 'kumite',
    kumite: 'so React knows which is which',
    result: 'pass-with-notes',
    notes: '- mention state that follows the item',
  },
  turns: [],
};

describe('prompts', () => {
  it('puts the whole Card and the learner Kumite in the Kumite prompt', () => {
    const prompt = kumitePrompt({ card, kumite: 'so React knows which is which' });

    expect(prompt).toContain('## Question\n\nWhy keys?');
    expect(prompt).toContain('## Explanation\n\nReconciliation matches by key.');
    expect(prompt).toContain("# Learner's Kumite\n\nso React knows which is which");
  });

  it('renders the conversation in order for a chat', () => {
    const prompt = chatPrompt({
      card,
      chat: {
        opening: { kind: 'self-graded', choice: 'know' },
        turns: [
          { role: 'learner', text: 'Why not index?' },
          { role: 'sensei', text: 'Because order changes.' },
        ],
      },
      message: 'And for static lists?',
    });

    expect(prompt.indexOf('**Learner:** Why not index?')).toBeLessThan(
      prompt.indexOf('**Sensei:** Because order changes.'),
    );
    expect(prompt).toContain("# Learner's message\n\nAnd for static lists?");
  });

  it('puts the Kumite and the verdict before the conversation of a chat', () => {
    const prompt = chatPrompt({
      card,
      chat: {
        ...afterKumite,
        turns: [
          { role: 'learner', text: 'Which state?' },
          { role: 'sensei', text: 'Local state.' },
        ],
      },
      message: 'Why was my point wrong?',
    });

    const kumite = prompt.indexOf("# Learner's Kumite\n\nso React knows which is which");
    const verdict = prompt.indexOf(
      "# Sensei's verdict\n\nResult: Pass with notes\n\n- mention state that follows the item",
    );
    const conversation = prompt.indexOf('# Conversation so far');
    expect(kumite).toBeGreaterThan(prompt.indexOf('# Card'));
    expect(verdict).toBeGreaterThan(kumite);
    expect(conversation).toBeGreaterThan(verdict);
  });

  it('renders only the Result of a clean Pass', () => {
    const prompt = chatPrompt({
      card,
      chat: {
        opening: { kind: 'kumite', kumite: 'identity', result: 'pass', notes: '' },
        turns: [],
      },
      message: 'More?',
    });

    expect(prompt).toContain("# Sensei's verdict\n\nResult: Pass\n\n# Conversation so far");
  });

  it("tells the Sensei how the learner graded themselves after Know or Don't know", () => {
    const know = chatPrompt({
      card,
      chat: { opening: { kind: 'self-graded', choice: 'know' }, turns: [] },
      message: 'Tell me more',
    });
    const dontKnow = chatPrompt({
      card,
      chat: { opening: { kind: 'self-graded', choice: 'dont-know' }, turns: [] },
      message: 'Explain',
    });

    expect(know).toContain(
      '# How the Card was revealed\n\nThe learner chose Know without answering: go deeper than the Card.',
    );
    expect(dontKnow).toContain("The learner chose Don't know: explain from scratch.");
    expect(know).not.toContain("# Learner's Kumite");
  });

  it('gives a reply the language of the learner and a Card the language of the Kata', () => {
    expect(KUMITE_SYSTEM_PROMPT).toContain(REPLY_LANGUAGE_RULE);
    expect(CHAT_SYSTEM_PROMPT).toContain(REPLY_LANGUAGE_RULE);
    expect(AUTHOR_SYSTEM_PROMPT).toContain(KATA_LANGUAGE_RULE);
    expect(AUTHOR_SYSTEM_PROMPT).not.toContain(REPLY_LANGUAGE_RULE);
  });

  it('includes the opening of the chat when a chat becomes Cards', () => {
    const prompt = authorPrompt({
      kind: 'from-chat',
      instruction: '',
      kata,
      existingQuestions: ['Why keys?'],
      context: {
        chat: {
          ...afterKumite,
          turns: [
            { role: 'learner', text: 'Which state?' },
            { role: 'sensei', text: 'Local state.' },
          ],
        },
      },
    });

    expect(prompt).toContain("# Learner's Kumite\n\nso React knows which is which");
    expect(prompt).toContain('Result: Pass with notes');
    expect(prompt).toContain('# Conversation\n\n**Learner:** Which state?');
    expect(prompt).toContain('# Questions already in the Kata (do not repeat)\n\n- Why keys?');
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
