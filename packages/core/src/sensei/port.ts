import { z } from 'zod';
import { DIFFICULTIES, RESULTS, type Card, type Kata, type KataId } from '../domain/types.js';
import { SLUG_PATTERN } from '../domain/ids.js';

export type HealthStatus = { ok: true } | { ok: false; reason: string };

export interface CheckInput {
  card: Card;
  /** The learner's own words. */
  answer: string;
}
export const checkOutputSchema = z.object({
  result: z.enum(RESULTS),
  /** What was missing or wrong; empty for a clean Pass. */
  notes: z.string(),
});
export type CheckOutput = z.infer<typeof checkOutputSchema>;

export const chatTurnSchema = z.object({
  role: z.enum(['learner', 'sensei']),
  text: z.string().min(1),
});
export type ChatTurn = z.infer<typeof chatTurnSchema>;

export interface ChatInput {
  card: Card;
  /** The whole conversation about this Card so far; the Sensei keeps no memory of it. */
  history: ChatTurn[];
  message: string;
}
export const chatOutputSchema = z.object({ reply: z.string().min(1) });
export type ChatOutput = z.infer<typeof chatOutputSchema>;

export const AUTHOR_KINDS = [
  'add-cards',
  'new-kata',
  'fix-card',
  'from-chat',
  'from-inbox',
] as const;
export type AuthorKind = (typeof AUTHOR_KINDS)[number];

export interface AuthorInput {
  kind: AuthorKind;
  /** The learner's words: what to add, what is wrong, what the note means. */
  instruction: string;
  /** null only for `new-kata`. */
  kata: Kata | null;
  /** Questions already in the Kata, so the Sensei avoids duplicates. */
  existingQuestions: string[];
  /** The Card to rewrite, for `fix-card`. */
  target?: Card;
  context?: { chat?: ChatTurn[] | undefined; note?: string | undefined };
}

export const proposedCardSchema = z.object({
  slug: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  explanation: z.string().optional(),
  bestPractice: z.string().optional(),
  tags: z.array(z.string()),
  difficulty: z.enum(DIFFICULTIES),
  source: z.string().optional(),
});
export type ProposedCard = z.infer<typeof proposedCardSchema>;

export const proposedKataSchema = z.object({
  id: z.string().regex(SLUG_PATTERN),
  title: z.string().min(1),
  description: z.string(),
  tags: z.array(z.string().regex(SLUG_PATTERN)),
});

/** What the Sensei proposes; the server turns it into files after `applyProposalRules`. */
export const authoringProposalSchema = z.object({
  kata: proposedKataSchema.optional(),
  cards: z.array(proposedCardSchema),
});
export type AuthoringProposal = z.infer<typeof authoringProposalSchema>;

/** The one replaceable boundary to the model (ADR 0001). Every method may throw SenseiError. */
export interface Sensei {
  healthCheck(): Promise<HealthStatus>;
  check(input: CheckInput): Promise<CheckOutput>;
  chat(input: ChatInput): Promise<ChatOutput>;
  author(input: AuthorInput): Promise<AuthoringProposal>;
}

export type SenseiErrorReason =
  'unavailable' | 'timeout' | 'invalid-output' | 'refused' | 'aborted';

export class SenseiError extends Error {
  constructor(
    readonly reason: SenseiErrorReason,
    message: string,
  ) {
    super(message);
    this.name = 'SenseiError';
  }
}

export function kataIdOfInput(input: AuthorInput): KataId | null {
  return input.kata?.id ?? null;
}
