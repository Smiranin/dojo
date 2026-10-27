import { Document, parse, YAMLSeq } from 'yaml';

const FENCE = '---';

export interface SplitDocument {
  /** The parsed YAML between the fences, `{}` when there is no front matter. */
  data: unknown;
  /** Everything after the closing fence (or the whole text without front matter). */
  body: string;
}

export class FrontMatterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FrontMatterError';
  }
}

/** Splits `---\n...\n---\n` off the top of a Markdown file and parses it as YAML. */
export function splitFrontMatter(text: string): SplitDocument {
  const lines = text.split('\n');
  if (lines[0]?.trim() !== FENCE) return { data: {}, body: text };
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === FENCE);
  if (end === -1) throw new FrontMatterError('The front matter is not closed with ---');
  const yamlText = lines.slice(1, end).join('\n');
  let data: unknown;
  try {
    data = yamlText.trim() === '' ? {} : parse(yamlText);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new FrontMatterError(`The front matter is not valid YAML: ${message}`);
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new FrontMatterError('The front matter must be a YAML mapping');
  }
  return { data, body: lines.slice(end + 1).join('\n') };
}

/**
 * Renders a front-matter block. Arrays are written in flow style (`[a, b]`) so the files the
 * Dojo writes look like the ones a person writes; key order is the order of the record.
 */
export function serializeFrontMatter(record: Record<string, unknown>): string {
  const doc = new Document(record);
  for (const key of Object.keys(record)) {
    const node = doc.get(key, true);
    if (node instanceof YAMLSeq) node.flow = true;
  }
  return `${FENCE}\n${doc.toString({ flowCollectionPadding: false })}${FENCE}\n`;
}
