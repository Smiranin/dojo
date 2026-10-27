import { z } from 'zod';
import { DIFFICULTIES, RESULTS, type Card, type ContentIssue, type Kata } from '../domain/types.js';
import { SLUG_PATTERN } from '../domain/ids.js';
import { AUTHOR_KINDS, chatTurnSchema } from '../sensei/port.js';
import { settingsSchema } from './settings.js';

const isoDate = z.iso.datetime();
const cardIdSchema = z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+$/, 'A Card id is <kataId>/<slug>');

export const repSchema = z.object({
  id: z.string().min(1),
  card: cardIdSchema,
  result: z.enum(RESULTS),
  at: isoDate,
});
export const repsBodySchema = z.object({ reps: z.array(repSchema).min(1) });
export const repsResponseSchema = z.object({ reps: z.array(repSchema) });
export const appendResultSchema = z.object({
  accepted: z.array(z.string()),
  duplicates: z.array(z.string()),
});
export type AppendResult = z.infer<typeof appendResultSchema>;

export const inboxNoteSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  at: isoDate,
});
export const inboxResponseSchema = z.object({ notes: z.array(inboxNoteSchema) });

export const kataSchema = z.object({
  id: z.string().regex(SLUG_PATTERN),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  pinned: z.boolean(),
  archived: z.boolean(),
});
export const kataFlagsPatchSchema = z
  .object({ pinned: z.boolean().optional(), archived: z.boolean().optional() })
  .refine((flags) => flags.pinned !== undefined || flags.archived !== undefined, {
    message: 'Nothing to change',
  });

export const cardSchema = z.object({
  id: cardIdSchema,
  kataId: z.string(),
  slug: z.string(),
  question: z.string(),
  answer: z.string(),
  explanation: z.string().optional(),
  bestPractice: z.string().optional(),
  tags: z.array(z.string()),
  difficulty: z.enum(DIFFICULTIES).optional(),
  source: z.string().optional(),
});

export const contentIssueSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('unknown-tag'), cardId: z.string(), tag: z.string() }),
  z.object({ kind: z.literal('missing-section'), cardId: z.string(), section: z.string() }),
  z.object({ kind: z.literal('invalid-front-matter'), path: z.string(), message: z.string() }),
  z.object({ kind: z.literal('invalid-kata'), kataId: z.string(), message: z.string() }),
]);

/** Everything under `content/`, read fresh on every request. */
export const contentSnapshotSchema = z.object({
  /** Changes whenever the snapshot was re-read; the web uses it to notice a change. */
  revision: z.string(),
  katas: z.array(kataSchema),
  cards: z.array(cardSchema),
  issues: z.array(contentIssueSchema),
});
/** Typed with the domain types, not inferred: zod widens optionals to `string | undefined`. */
export interface ContentSnapshot {
  revision: string;
  katas: Kata[];
  cards: Card[];
  issues: ContentIssue[];
}

export const healthStatusSchema = z.union([
  z.object({ ok: z.literal(true) }),
  z.object({ ok: z.literal(false), reason: z.string() }),
]);
export const healthResponseSchema = z.object({
  ok: z.literal(true),
  sensei: healthStatusSchema,
  contentDir: z.string(),
  version: z.string(),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const settingsResponseSchema = settingsSchema;

export const senseiCheckRequestSchema = z.object({
  cardId: cardIdSchema,
  answer: z.string().min(1),
});
export const senseiChatRequestSchema = z.object({
  cardId: cardIdSchema,
  history: z.array(chatTurnSchema),
  message: z.string().min(1),
});
export const senseiAuthorRequestSchema = z.object({
  kind: z.enum(AUTHOR_KINDS),
  instruction: z.string(),
  kataId: z.string().regex(SLUG_PATTERN).optional(),
  cardId: cardIdSchema.optional(),
  context: z
    .object({ chat: z.array(chatTurnSchema).optional(), note: z.string().optional() })
    .optional(),
});
export type SenseiAuthorRequest = z.infer<typeof senseiAuthorRequestSchema>;
export const senseiAuthorResponseSchema = z.object({
  kataId: z.string(),
  cards: z.array(cardIdSchema),
  issues: z.array(z.string()),
});
export type SenseiAuthorResponse = z.infer<typeof senseiAuthorResponseSchema>;

export const errorBodySchema = z.object({
  reason: z.string(),
  message: z.string(),
  issues: z.unknown().optional(),
});
export type ErrorBody = z.infer<typeof errorBodySchema>;

/** Names on the `GET /api/events` stream; `data` is `{ at }` and clients refetch the slice. */
export const SSE_EVENTS = {
  content: 'content.changed',
  reps: 'reps.changed',
  inbox: 'inbox.changed',
  ping: 'ping',
} as const;
export type SseEventName = (typeof SSE_EVENTS)[keyof typeof SSE_EVENTS];
