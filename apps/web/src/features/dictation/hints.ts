import type { Kata } from '@dojo/core';

/** Kobzar's limits on the hints of one request. */
export const KOBZAR_MAX_HINTS = 50;
export const KOBZAR_MAX_HINT_LENGTH = 64;

/**
 * The words Kobzar should expect in a dictation about this Kata: its title and its Tags.
 * An over-long entry is dropped, not cut: half a term would teach Kobzar the wrong word.
 */
export function kataHints(kata: Kata | undefined): string[] {
  if (!kata) return [];
  const hints = new Set<string>();
  for (const entry of [kata.title, ...kata.tags]) {
    const hint = entry.trim();
    if (hint !== '' && hint.length <= KOBZAR_MAX_HINT_LENGTH) hints.add(hint);
  }
  return [...hints].slice(0, KOBZAR_MAX_HINTS);
}
