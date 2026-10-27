import { z } from 'zod';
import { DIFFICULTIES, type Card, type ContentIssue, type KataId } from '../domain/types.js';
import { cardIdOf, isSlug } from '../domain/ids.js';
import { FrontMatterError, serializeFrontMatter, splitFrontMatter } from './front-matter.js';
import { joinSections, splitSections } from './sections.js';

export const cardFrontMatterSchema = z.object({
  difficulty: z.enum(DIFFICULTIES).optional(),
  tags: z.array(z.string().min(1)).default([]),
  source: z.string().min(1).optional(),
});

/** Section titles as the Dojo writes them; parsing matches them case-insensitively. */
export const CARD_SECTIONS = {
  question: 'Question',
  answer: 'Answer',
  explanation: 'Explanation',
  bestPractice: 'Best practice',
} as const;

const REQUIRED_SECTIONS = ['question', 'answer'] as const;

export interface ParsedCardFile {
  card: Card | null;
  issues: ContentIssue[];
}

/**
 * Parses one Card file. A Card with a missing required section is excluded; a Tag that the Kata
 * does not declare is dropped from the Card. Both are reported as issues, never thrown.
 */
export function parseCardFile(
  text: string,
  kataId: KataId,
  slug: string,
  kataTags: readonly string[],
): ParsedCardFile {
  const cardId = cardIdOf(kataId, slug);
  const issues: ContentIssue[] = [];
  if (!isSlug(slug)) {
    issues.push({ kind: 'invalid-front-matter', path: cardId, message: 'The file name is not a slug' });
    return { card: null, issues };
  }
  let split;
  try {
    split = splitFrontMatter(text);
  } catch (error) {
    if (!(error instanceof FrontMatterError)) throw error;
    issues.push({ kind: 'invalid-front-matter', path: cardId, message: error.message });
    return { card: null, issues };
  }
  const front = cardFrontMatterSchema.safeParse(split.data);
  if (!front.success) {
    issues.push({
      kind: 'invalid-front-matter',
      path: cardId,
      message: z.prettifyError(front.error),
    });
    return { card: null, issues };
  }
  const sections = splitSections(split.body);
  for (const key of REQUIRED_SECTIONS) {
    const title = CARD_SECTIONS[key];
    if (!sections.get(title.toLowerCase())) {
      issues.push({ kind: 'missing-section', cardId, section: title });
    }
  }
  if (issues.length > 0) return { card: null, issues };

  const allowed = new Set(kataTags);
  const tags: string[] = [];
  for (const tag of front.data.tags) {
    if (!allowed.has(tag)) issues.push({ kind: 'unknown-tag', cardId, tag });
    else if (!tags.includes(tag)) tags.push(tag);
  }
  const explanation = sections.get(CARD_SECTIONS.explanation.toLowerCase());
  const bestPractice = sections.get(CARD_SECTIONS.bestPractice.toLowerCase());
  const card: Card = {
    id: cardId,
    kataId,
    slug,
    question: sections.get(CARD_SECTIONS.question.toLowerCase()) as string,
    answer: sections.get(CARD_SECTIONS.answer.toLowerCase()) as string,
    tags,
    ...(explanation && { explanation }),
    ...(bestPractice && { bestPractice }),
    ...(front.data.difficulty !== undefined && { difficulty: front.data.difficulty }),
    ...(front.data.source !== undefined && { source: front.data.source }),
  };
  return { card, issues };
}

/** Writes a Card the way a person would: front matter, then the sections in canonical order. */
export function serializeCardFile(card: Omit<Card, 'id' | 'kataId' | 'slug'>): string {
  const frontMatter = serializeFrontMatter({
    ...(card.difficulty !== undefined && { difficulty: card.difficulty }),
    tags: card.tags,
    ...(card.source !== undefined && { source: card.source }),
  });
  const sections: Array<[string, string]> = [
    [CARD_SECTIONS.question, card.question],
    [CARD_SECTIONS.answer, card.answer],
  ];
  if (card.explanation) sections.push([CARD_SECTIONS.explanation, card.explanation]);
  if (card.bestPractice) sections.push([CARD_SECTIONS.bestPractice, card.bestPractice]);
  return `${frontMatter}\n${joinSections(sections)}`;
}
