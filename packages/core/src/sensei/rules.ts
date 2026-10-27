import { slugify } from '../content/slugify.js';
import type { AuthorInput, AuthoringProposal, ProposedCard } from './port.js';

export interface AppliedProposal {
  proposal: AuthoringProposal;
  /** Human-readable notes on what was changed or dropped; empty when the proposal was clean. */
  issues: string[];
}

export class ProposalRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProposalRejectedError';
  }
}

/**
 * Makes a proposal safe to write (SPEC req. 29a, 31): Tags outside the Kata's list are dropped,
 * slugs are normalized, a fix keeps the target's slug and is exactly one Card, and an empty
 * proposal is rejected because there is nothing to write.
 */
export function applyProposalRules(
  proposal: AuthoringProposal,
  input: AuthorInput,
): AppliedProposal {
  const issues: string[] = [];
  if (input.kind === 'new-kata' && !proposal.kata) {
    throw new ProposalRejectedError('A new Kata was asked for but none was proposed');
  }
  const kata = input.kind === 'new-kata' ? proposal.kata : undefined;
  const allowedTags = new Set(kata ? kata.tags : (input.kata?.tags ?? []));

  let cards = proposal.cards.map((card) => cleanCard(card, allowedTags, issues));
  if (input.kind === 'fix-card') {
    if (!input.target) throw new ProposalRejectedError('fix-card needs a target Card');
    const first = cards[0];
    if (!first) throw new ProposalRejectedError('The fix proposed no Card');
    if (cards.length > 1) issues.push(`Only the first of ${cards.length} proposed Cards is kept`);
    cards = [{ ...first, slug: input.target.slug }];
  } else if (cards.length === 0) {
    throw new ProposalRejectedError('The proposal holds no Cards');
  }
  return { proposal: { ...(kata && { kata }), cards }, issues };
}

function cleanCard(card: ProposedCard, allowedTags: Set<string>, issues: string[]): ProposedCard {
  const slug = slugify(card.slug) || slugify(card.question);
  if (slug === '') throw new ProposalRejectedError('A proposed Card has no usable slug');
  if (slug !== card.slug) issues.push(`Slug "${card.slug}" normalized to "${slug}"`);
  const tags: string[] = [];
  for (const tag of card.tags) {
    if (!allowedTags.has(tag)) issues.push(`Tag "${tag}" is not in the Kata and was dropped`);
    else if (!tags.includes(tag)) tags.push(tag);
  }
  return { ...card, slug, tags };
}
