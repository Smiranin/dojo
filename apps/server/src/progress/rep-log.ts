import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { repSchema, type AppendResult, type Rep } from '@dojo/core';

export class RepLogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepLogError';
  }
}

/**
 * The append-only Rep log (ADR 0002): one JSON object per line in `reps.jsonl`. The file is
 * the truth, so every operation re-reads it; appends are serialized through a promise chain
 * and a Rep whose id is already in the file is reported as a duplicate, never written twice.
 */
export class RepLog {
  private chain: Promise<unknown> = Promise.resolve();

  constructor(readonly path: string) {}

  async readAll(): Promise<Rep[]> {
    let text: string;
    try {
      text = await readFile(this.path, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
    const reps: Rep[] = [];
    const lines = text.split('\n');
    for (const [index, line] of lines.entries()) {
      if (line.trim() === '') continue;
      let raw: unknown;
      try {
        raw = JSON.parse(line);
      } catch {
        throw new RepLogError(`${this.path}:${index + 1} is not JSON`);
      }
      const parsed = repSchema.safeParse(raw);
      if (!parsed.success) throw new RepLogError(`${this.path}:${index + 1} is not a Rep`);
      reps.push(parsed.data);
    }
    return reps;
  }

  append(reps: readonly Rep[]): Promise<AppendResult> {
    const run = this.chain.then(() => this.appendNow(reps));
    // Keep the chain alive after a failure so the next append still runs.
    this.chain = run.catch(() => undefined);
    return run;
  }

  private async appendNow(reps: readonly Rep[]): Promise<AppendResult> {
    const known = new Set((await this.readAll()).map((rep) => rep.id));
    const accepted: string[] = [];
    const duplicates: string[] = [];
    const lines: string[] = [];
    for (const rep of reps) {
      if (known.has(rep.id)) {
        duplicates.push(rep.id);
        continue;
      }
      known.add(rep.id);
      accepted.push(rep.id);
      lines.push(JSON.stringify(rep));
    }
    if (lines.length > 0) {
      await mkdir(dirname(this.path), { recursive: true });
      await appendFile(this.path, lines.map((line) => `${line}\n`).join(''));
    }
    return { accepted, duplicates };
  }
}
