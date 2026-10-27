/** The folder name of a Kata under `content/`: `[a-z0-9-]+`. */
export type KataId = string;
/** `<kataId>/<slug>`: the relative path of the Card file without `.md`. */
export type CardId = string;

export const RESULTS = ['fail', 'pass-with-notes', 'pass'] as const;
export type Result = (typeof RESULTS)[number];

export const BELTS = ['new', 'learning', 'known'] as const;
export type Belt = (typeof BELTS)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** One answer attempt; the log of Reps is the only progress record (ADR 0002). */
export interface Rep {
  /** Generated on the device that made the Rep so a retried write never duplicates. */
  id: string;
  card: CardId;
  result: Result;
  /** ISO 8601 timestamp. */
  at: string;
}

export interface Kata {
  id: KataId;
  title: string;
  description: string;
  /** The only place Tags are declared; a Card may use these and nothing else. */
  tags: string[];
  pinned: boolean;
  archived: boolean;
}

export interface Card {
  id: CardId;
  kataId: KataId;
  slug: string;
  question: string;
  answer: string;
  explanation?: string;
  bestPractice?: string;
  tags: string[];
  /** Absent means unset: the Difficulty filter treats it as matching any value. */
  difficulty?: Difficulty;
  source?: string;
}

export interface InboxNote {
  id: string;
  text: string;
  /** ISO 8601 timestamp. */
  at: string;
}

/** A recoverable problem found while reading content; reported, never thrown. */
export type ContentIssue =
  | { kind: 'unknown-tag'; cardId: CardId; tag: string }
  | { kind: 'missing-section'; cardId: CardId; section: string }
  | { kind: 'invalid-front-matter'; path: string; message: string }
  | { kind: 'invalid-kata'; kataId: KataId; message: string };
