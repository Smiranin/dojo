/** How dictated text joins what is already in a field: after it, separated by one space. */
export function appendDictated(current: string, text: string): string {
  const dictated = text.trim();
  if (dictated === '') return current;
  if (current === '' || /\s$/.test(current)) return current + dictated;
  return `${current} ${dictated}`;
}
