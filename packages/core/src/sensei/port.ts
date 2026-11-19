import { z } from 'zod';
import { DIFFICULTIES, RESULTS, type Card, type Kata, type KataId } from '../domain/types.js';
import { SLUG_PATTERN } from '../domain/ids.js';

export type HealthStatus = { ok: true } | { ok: false; reason: string };

/**
 * The part of the platform's `AbortSignal` the Sensei needs. Core is typed without the DOM or
 * Node, so it names the shape; the real signal of either platform fits it.
 */
export interface AbortSignalLike {
  readonly aborted: boolean;
  addEventListener(type: 'abort', listener: () => void, options?: { once?: boolean }): void;
  removeEventListener(type: 'abort', listener: () => void): void;
}

export interface KumiteInput {
  card: Card;
  /** The learner's answer to the Card's question, in their own words. */
  kumite: string;
  /** Aborts the Sensei's work when nobody waits for the verdict any more. */
  signal?: AbortSignalLike;
}
export const kumiteOutputSchema = z.object({
  result: z.enum(RESULTS),
  /** What was missing or wrong; empty for a clean Pass. */
  notes: z.string(),
});
export type KumiteOutput = z.infer<typeof kumiteOutputSchema>;

export const chatTurnSchema = z.object({
  role: z.enum(['learner', 'sensei']),
  text: z.string().min(1),
});
export type ChatTurn = z.infer<typeof chatTurnSchema>;

/** How a Card was revealed without a Kumite: the learner graded themselves. */
export const SELF_GRADES = ['know', 'dont-know'] as const;
export type SelfGrade = (typeof SELF_GRADES)[number];

/** How a Chat began: a Kumite with the Sensei's verdict, or the learner's own Know / Don't know. */
export const chatOpeningSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('kumite'),
    kumite: z.string().min(1),
    /** The Sensei's verdict, not the Result the learner may have changed it to. */
    result: z.enum(RESULTS),
    notes: z.string(),
  }),
  z.object({ kind: z.literal('self-graded'), choice: z.enum(SELF_GRADES) }),
]);
export type ChatOpening = z.infer<typeof chatOpeningSchema>;

/** A conversation about one Card: how it began, then the turns that followed. */
export const chatSchema = z.object({
  opening: chatOpeningSchema,
  turns: z.array(chatTurnSchema),
});
export type Chat = z.infer<typeof chatSchema>;

export interface ChatInput {
  card: Card;
  /** The whole Chat about this Card so far; the Sensei keeps no memory of it. */
  chat: Chat;
  message: string;
  /** Aborts the Sensei's work when nobody waits for the reply any more. */
  signal?: AbortSignalLike;
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
  context?: { chat?: Chat | undefined; note?: string | undefined };
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

/** The one replaceable boundary to the model. Every method may throw SenseiError. */
export interface Sensei {
  healthCheck(): Promise<HealthStatus>;
  kumite(input: KumiteInput): Promise<KumiteOutput>;
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
