import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  KATA_FILE_NAME,
  isSlug,
  parseCardFile,
  parseKataFile,
  serializeCardFile,
  serializeKataFile,
  type Card,
  type ContentIssue,
  type ContentSnapshot,
  type Kata,
  type KataId,
} from '@dojo/core';
import { ConflictError, NotFoundError } from '../errors.js';

const MARKDOWN = '.md';

export interface KataFlags {
  pinned?: boolean | undefined;
  archived?: boolean | undefined;
}

/** The only module that reads or writes `content/`. Every read is a fresh walk of the folder. */
export class ContentStore {
  constructor(readonly contentDir: string) {}

  kataDir(kataId: KataId): string {
    return join(this.contentDir, kataId);
  }

  kataPath(kataId: KataId): string {
    return join(this.kataDir(kataId), KATA_FILE_NAME);
  }

  cardPath(kataId: KataId, slug: string): string {
    return join(this.kataDir(kataId), `${slug}${MARKDOWN}`);
  }

  async snapshot(): Promise<ContentSnapshot> {
    const katas: Kata[] = [];
    const cards: Card[] = [];
    const issues: ContentIssue[] = [];
    const hash = createHash('sha1');
    const folders = (await readdir(this.contentDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name)
      .sort();
    for (const kataId of folders) {
      let kataText: string;
      try {
        kataText = await readFile(this.kataPath(kataId), 'utf8');
      } catch {
        issues.push({ kind: 'invalid-kata', kataId, message: `No ${KATA_FILE_NAME} in the folder` });
        continue;
      }
      hash.update(kataId).update(kataText);
      const parsedKata = parseKataFile(kataText, kataId);
      issues.push(...parsedKata.issues);
      if (!parsedKata.kata) continue;
      katas.push(parsedKata.kata);
      const files = (await readdir(this.kataDir(kataId)))
        .filter((name) => name.endsWith(MARKDOWN) && name !== KATA_FILE_NAME && !name.startsWith('.'))
        .sort();
      for (const file of files) {
        const slug = file.slice(0, -MARKDOWN.length);
        const text = await readFile(join(this.kataDir(kataId), file), 'utf8');
        hash.update(file).update(text);
        const parsed = parseCardFile(text, kataId, slug, parsedKata.kata.tags);
        issues.push(...parsed.issues);
        if (parsed.card) cards.push(parsed.card);
      }
    }
    return { revision: hash.digest('hex'), katas, cards, issues };
  }

  async readKata(kataId: KataId): Promise<{ kata: Kata; body: string }> {
    let text: string;
    try {
      text = await readFile(this.kataPath(kataId), 'utf8');
    } catch {
      throw new NotFoundError(`Kata ${kataId}`);
    }
    const parsed = parseKataFile(text, kataId);
    if (!parsed.kata) throw new NotFoundError(`Kata ${kataId}`);
    return { kata: parsed.kata, body: parsed.body };
  }

  /** Creates the folder and `kata.md` of a new Kata; refuses to touch an existing one. */
  async createKata(kata: Kata): Promise<void> {
    if (!isSlug(kata.id)) throw new ConflictError('invalid-kata-id', `"${kata.id}" is not a slug`);
    try {
      await mkdir(this.kataDir(kata.id));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new ConflictError('kata-exists', `Kata ${kata.id} already exists`);
      }
      throw error;
    }
    await writeFile(this.kataPath(kata.id), serializeKataFile(kata), { flag: 'wx' });
  }

  /** Rewrites only the front matter of `kata.md`; the owner's notes below it stay verbatim. */
  async patchKataFlags(kataId: KataId, flags: KataFlags): Promise<Kata> {
    const { kata, body } = await this.readKata(kataId);
    const updated: Kata = {
      ...kata,
      ...(flags.pinned !== undefined && { pinned: flags.pinned }),
      ...(flags.archived !== undefined && { archived: flags.archived }),
    };
    await writeFile(this.kataPath(kataId), serializeKataFile(updated, body));
    return updated;
  }

  async cardExists(kataId: KataId, slug: string): Promise<boolean> {
    try {
      await readFile(this.cardPath(kataId, slug));
      return true;
    } catch {
      return false;
    }
  }

  /** Writes a Card file; the Kata folder must already exist. Overwrites when `overwrite` is set. */
  async writeCard(
    kataId: KataId,
    slug: string,
    card: Omit<Card, 'id' | 'kataId' | 'slug'>,
    options: { overwrite: boolean },
  ): Promise<void> {
    await this.readKata(kataId);
    const path = this.cardPath(kataId, slug);
    try {
      await writeFile(path, serializeCardFile(card), { flag: options.overwrite ? 'w' : 'wx' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        throw new ConflictError('card-exists', `Card ${kataId}/${slug} already exists`);
      }
      throw error;
    }
  }

  /** Removes the Card file; Reps are untouched (ADR 0002). */
  async deleteCard(kataId: KataId, slug: string): Promise<void> {
    if (!isSlug(kataId) || !isSlug(slug)) throw new NotFoundError(`Card ${kataId}/${slug}`);
    if (!(await this.cardExists(kataId, slug))) throw new NotFoundError(`Card ${kataId}/${slug}`);
    await rm(this.cardPath(kataId, slug));
  }
}
