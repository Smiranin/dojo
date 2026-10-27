import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { defaultSettings, type Rep } from '@dojo/core';
import { FakeSensei, sampleContent, type FixtureFile } from '@dojo/core/testing';
import type { FastifyInstance } from 'fastify';
import { buildApp, REPS_FILE, type BuiltApp } from '../src/app.js';

export interface TestServer extends BuiltApp {
  app: FastifyInstance;
  contentDir: string;
  dataDir: string;
  sensei: FakeSensei;
  cleanup(): Promise<void>;
}

export interface TestServerOptions {
  /** Files to write under the temp content dir; the sample content by default. */
  content?: FixtureFile[];
  /** Lines to seed `reps.jsonl` with. */
  reps?: Rep[];
  sensei?: FakeSensei;
  healthTtlMs?: number;
}

export async function writeContent(contentDir: string, files: FixtureFile[]): Promise<void> {
  for (const file of files) {
    const path = join(contentDir, file.path);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, file.text);
  }
}

/** A server on a temp content dir, a temp data dir and a FakeSensei, driven with `inject`. */
export async function testServer(options: TestServerOptions = {}): Promise<TestServer> {
  const contentDir = await mkdtemp(join(tmpdir(), 'dojo-content-'));
  const dataDir = await mkdtemp(join(tmpdir(), 'dojo-data-'));
  await writeContent(contentDir, options.content ?? sampleContent());
  if (options.reps) {
    await writeFile(
      join(dataDir, REPS_FILE),
      options.reps.map((rep) => `${JSON.stringify(rep)}\n`).join(''),
    );
  }
  const sensei = options.sensei ?? new FakeSensei();
  const built = await buildApp({
    settings: defaultSettings(),
    contentDir,
    dataDir,
    sensei,
    version: 'test',
    heartbeatMs: 50,
    watch: { debounceMs: 20 },
    ...(options.healthTtlMs !== undefined && { healthTtlMs: options.healthTtlMs }),
  });
  return {
    ...built,
    contentDir,
    dataDir,
    sensei,
    cleanup: async () => {
      await built.app.close();
      await Promise.all([
        rm(contentDir, { recursive: true, force: true }),
        rm(dataDir, { recursive: true, force: true }),
      ]);
    },
  };
}
