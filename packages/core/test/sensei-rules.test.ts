import { describe, expect, it } from 'vitest';
import {
  applyProposalRules,
  ProposalRejectedError,
  type AuthorInput,
  type AuthoringProposal,
  type Card,
  type Kata,
} from '../src/index.js';

const kata: Kata = {
  id: 'react',
  title: 'React',
  description: '',
  tags: ['hooks', 'performance'],
  pinned: false,
  archived: false,
};

const proposedCard = {
  slug: 'use-memo',
  question: 'Q?',
  answer: 'A.',
  tags: ['hooks'],
  difficulty: 'medium' as const,
};

function addCards(cards: AuthoringProposal['cards']): [AuthoringProposal, AuthorInput] {
  return [{ cards }, { kind: 'add-cards', instruction: '', kata, existingQuestions: [] }];
}

describe('applyProposalRules', () => {
  it('drops a Tag the Kata does not declare and says so', () => {
    const [proposal, input] = addCards([{ ...proposedCard, tags: ['hooks', 'suspense'] }]);

    const applied = applyProposalRules(proposal, input);

    expect(applied.proposal.cards[0]?.tags).toEqual(['hooks']);
    expect(applied.issues).toEqual(['Tag "suspense" is not in the Kata and was dropped']);
  });

  it('normalizes a slug the Sensei wrote in free form', () => {
    const [proposal, input] = addCards([{ ...proposedCard, slug: 'Use Memo!' }]);

    const applied = applyProposalRules(proposal, input);

    expect(applied.proposal.cards[0]?.slug).toBe('use-memo');
  });

  it('rejects a proposal with no Cards', () => {
    const [proposal, input] = addCards([]);

    expect(() => applyProposalRules(proposal, input)).toThrow(ProposalRejectedError);
  });

  it('keeps the target slug and only one Card for a fix', () => {
    const target: Card = {
      id: 'react/keys',
      kataId: 'react',
      slug: 'keys',
      question: '',
      answer: '',
      tags: [],
    };
    const input: AuthorInput = {
      kind: 'fix-card',
      instruction: '',
      kata,
      existingQuestions: [],
      target,
    };
    const proposal: AuthoringProposal = {
      cards: [
        { ...proposedCard, slug: 'new-slug' },
        { ...proposedCard, slug: 'extra' },
      ],
    };

    const applied = applyProposalRules(proposal, input);

    expect(applied.proposal.cards).toHaveLength(1);
    expect(applied.proposal.cards[0]?.slug).toBe('keys');
    expect(applied.issues).toContain('Only the first of 2 proposed Cards is kept');
  });

  it('uses the proposed Tag list for a new Kata', () => {
    const input: AuthorInput = {
      kind: 'new-kata',
      instruction: '',
      kata: null,
      existingQuestions: [],
    };
    const proposal: AuthoringProposal = {
      kata: { id: 'go', title: 'Go', description: '', tags: ['channels'] },
      cards: [{ ...proposedCard, tags: ['channels', 'hooks'] }],
    };

    const applied = applyProposalRules(proposal, input);

    expect(applied.proposal.kata?.id).toBe('go');
    expect(applied.proposal.cards[0]?.tags).toEqual(['channels']);
  });

  it('rejects a new Kata request whose proposal has no Kata', () => {
    const input: AuthorInput = {
      kind: 'new-kata',
      instruction: '',
      kata: null,
      existingQuestions: [],
    };

    expect(() => applyProposalRules({ cards: [proposedCard] }, input)).toThrow(
      ProposalRejectedError,
    );
  });
});
