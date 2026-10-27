import { z } from 'zod';
import type { ContentIssue, Kata, KataId } from '../domain/types.js';
import { isSlug } from '../domain/ids.js';
import { FrontMatterError, serializeFrontMatter, splitFrontMatter } from './front-matter.js';

export const kataFrontMatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  tags: z.array(z.string().min(1)).default([]),
  pinned: z.boolean().default(false),
  archived: z.boolean().default(false),
});

export interface ParsedKataFile {
  kata: Kata | null;
  /** The Markdown after the front matter, kept verbatim so a flag change never touches notes. */
  body: string;
  issues: ContentIssue[];
}

export const KATA_FILE_NAME = 'kata.md';

export function parseKataFile(text: string, kataId: KataId): ParsedKataFile {
  if (!isSlug(kataId)) {
    return {
      kata: null,
      body: '',
      issues: [{ kind: 'invalid-kata', kataId, message: 'The folder name is not a slug' }],
    };
  }
  let split;
  try {
    split = splitFrontMatter(text);
  } catch (error) {
    if (!(error instanceof FrontMatterError)) throw error;
    return { kata: null, body: '', issues: [{ kind: 'invalid-kata', kataId, message: error.message }] };
  }
  const parsed = kataFrontMatterSchema.safeParse(split.data);
  if (!parsed.success) {
    return {
      kata: null,
      body: split.body,
      issues: [{ kind: 'invalid-kata', kataId, message: z.prettifyError(parsed.error) }],
    };
  }
  const { title, description, tags, pinned, archived } = parsed.data;
  const uniqueTags = [...new Set(tags)];
  return {
    kata: { id: kataId, title, description, tags: uniqueTags, pinned, archived },
    body: split.body,
    issues: [],
  };
}

export function serializeKataFile(kata: Kata, body = ''): string {
  const frontMatter = serializeFrontMatter({
    title: kata.title,
    description: kata.description,
    tags: kata.tags,
    pinned: kata.pinned,
    archived: kata.archived,
  });
  return body.trim() === '' ? frontMatter : `${frontMatter}\n${body.trim()}\n`;
}
