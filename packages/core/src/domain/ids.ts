import type { CardId, KataId } from './types.js';

/** Kata folder names and Card file stems share this shape. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

export function cardIdOf(kataId: KataId, slug: string): CardId {
  return `${kataId}/${slug}`;
}

export function splitCardId(cardId: CardId): { kataId: KataId; slug: string } | null {
  const parts = cardId.split('/');
  if (parts.length !== 2) return null;
  const [kataId, slug] = parts as [string, string];
  if (!isSlug(kataId) || !isSlug(slug)) return null;
  return { kataId, slug };
}
