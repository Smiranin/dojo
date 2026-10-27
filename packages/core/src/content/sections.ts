const HEADING = /^##\s+(.+?)\s*$/;
const FENCE = /^\s*(```|~~~)/;

/** Splits a Markdown body into its level-2 sections, keyed by the lower-cased heading. */
export function splitSections(body: string): Map<string, string> {
  const sections = new Map<string, string>();
  let current: string | null = null;
  let buffer: string[] = [];
  let fence: string | null = null;
  const flush = () => {
    if (current !== null) sections.set(current, buffer.join('\n').trim());
    buffer = [];
  };
  for (const line of body.split('\n')) {
    const fenceMatch = FENCE.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1] as string;
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      buffer.push(line);
      continue;
    }
    const heading = fence === null ? HEADING.exec(line) : null;
    if (heading) {
      flush();
      current = (heading[1] as string).toLowerCase();
      continue;
    }
    buffer.push(line);
  }
  flush();
  return sections;
}

/** Joins named sections back into a body, `## Title` with a blank line around each. */
export function joinSections(sections: Array<[title: string, text: string]>): string {
  return sections.map(([title, text]) => `## ${title}\n\n${text.trim()}\n`).join('\n');
}
