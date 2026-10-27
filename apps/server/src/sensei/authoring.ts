import {
  applyProposalRules,
  cardIdOf,
  type AuthorInput,
  type Card,
  type Kata,
  type ProposedCard,
  type SenseiAuthorRequest,
  type SenseiAuthorResponse,
} from '@dojo/core';
import type { ServerContext } from '../context.js';
import { HttpProblem, NotFoundError } from '../errors.js';

/** Past this many collisions something is wrong with the proposal, not with the slug. */
const MAX_SLUG_SUFFIX = 50;

function cardFields(card: ProposedCard): Omit<Card, 'id' | 'kataId' | 'slug'> {
  return {
    question: card.question,
    answer: card.answer,
    tags: card.tags,
    difficulty: card.difficulty,
    ...(card.explanation && { explanation: card.explanation }),
    ...(card.bestPractice && { bestPractice: card.bestPractice }),
    ...(card.source && { source: card.source }),
  };
}

/**
 * Asks the Sensei for a proposal and turns it into files: the Sensei never writes, the rules in
 * core make the proposal safe, and this module decides file names. Nothing is ever deleted
 * here (SPEC req. 31); an existing Kata's `kata.md` is never rewritten (req. 29a).
 */
export async function applyProposal(
  ctx: ServerContext,
  request: SenseiAuthorRequest,
): Promise<SenseiAuthorResponse> {
  const snapshot = await ctx.content.snapshot();
  let kata: Kata | null = null;
  if (request.kind !== 'new-kata') {
    if (!request.kataId) {
      throw new HttpProblem(400, 'invalid-body', `${request.kind} needs a kataId`);
    }
    kata = snapshot.katas.find((k) => k.id === request.kataId) ?? null;
    if (!kata) throw new NotFoundError(`Kata ${request.kataId}`);
  }
  let target: Card | undefined;
  if (request.kind === 'fix-card') {
    if (!request.cardId) throw new HttpProblem(400, 'invalid-body', 'fix-card needs a cardId');
    target = snapshot.cards.find((c) => c.id === request.cardId);
    if (!target) throw new NotFoundError(`Card ${request.cardId}`);
  }
  const input: AuthorInput = {
    kind: request.kind,
    instruction: request.instruction,
    kata,
    existingQuestions: kata
      ? snapshot.cards.filter((c) => c.kataId === kata.id).map((c) => c.question)
      : [],
    ...(target && { target }),
    ...(request.context && { context: request.context }),
  };

  const raw = await ctx.sensei.author(input);
  const { proposal, issues } = applyProposalRules(raw, input);

  let kataId: string;
  if (proposal.kata) {
    const created: Kata = { ...proposal.kata, pinned: false, archived: false };
    await ctx.content.createKata(created);
    kataId = created.id;
  } else {
    kataId = (kata as Kata).id;
  }

  const written: string[] = [];
  for (const card of proposal.cards) {
    if (request.kind === 'fix-card') {
      await ctx.content.writeCard(kataId, card.slug, cardFields(card), { overwrite: true });
      written.push(cardIdOf(kataId, card.slug));
      continue;
    }
    const slug = await freeSlug(ctx, kataId, card.slug, written);
    await ctx.content.writeCard(kataId, slug, cardFields(card), { overwrite: false });
    written.push(cardIdOf(kataId, slug));
  }
  return { kataId, cards: written, issues };
}

/** The proposed slug, or the first `-2`, `-3`, … variant that is free on disk and in this batch. */
async function freeSlug(
  ctx: ServerContext,
  kataId: string,
  slug: string,
  writtenInBatch: string[],
): Promise<string> {
  const taken = async (candidate: string) =>
    writtenInBatch.includes(cardIdOf(kataId, candidate)) ||
    (await ctx.content.cardExists(kataId, candidate));
  if (!(await taken(slug))) return slug;
  for (let n = 2; n <= MAX_SLUG_SUFFIX; n += 1) {
    const candidate = `${slug}-${n}`;
    if (!(await taken(candidate))) return candidate;
  }
  throw new HttpProblem(409, 'slug-exhausted', `Too many Cards named ${slug}`);
}
