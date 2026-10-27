import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { inboxNoteSchema, type InboxNote } from '@dojo/core';
import { z } from 'zod';

const inboxFileSchema = z.object({ notes: z.array(inboxNoteSchema) });

export class InboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InboxError';
  }
}

/** `inbox.json`, rewritten whole on every change; add and remove are idempotent by id. */
export class InboxStore {
  private chain: Promise<unknown> = Promise.resolve();

  constructor(readonly path: string) {}

  async list(): Promise<InboxNote[]> {
    let text: string;
    try {
      text = await readFile(this.path, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new InboxError(`${this.path} is not JSON`);
    }
    const parsed = inboxFileSchema.safeParse(raw);
    if (!parsed.success) throw new InboxError(`${this.path}: ${z.prettifyError(parsed.error)}`);
    return parsed.data.notes;
  }

  add(note: InboxNote): Promise<InboxNote> {
    return this.serialized(async () => {
      const notes = await this.list();
      const existing = notes.find((n) => n.id === note.id);
      if (existing) return existing;
      await this.write([...notes, note]);
      return note;
    });
  }

  remove(id: string): Promise<void> {
    return this.serialized(async () => {
      const notes = await this.list();
      if (!notes.some((n) => n.id === id)) return;
      await this.write(notes.filter((n) => n.id !== id));
    });
  }

  private serialized<T>(task: () => Promise<T>): Promise<T> {
    const run = this.chain.then(task);
    this.chain = run.catch(() => undefined);
    return run;
  }

  private async write(notes: InboxNote[]): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    // Write beside and rename so a crash never leaves a half-written Inbox.
    const tmp = `${this.path}.tmp`;
    await writeFile(tmp, `${JSON.stringify({ notes }, null, 2)}\n`);
    await rename(tmp, this.path);
  }
}
