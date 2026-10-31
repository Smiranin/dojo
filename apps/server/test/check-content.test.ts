import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sampleContent } from '@dojo/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkContent, formatReport } from '../src/content/check-content.js';
import { writeContent } from './helpers.js';

describe('content check', () => {
  let contentDir: string;
  beforeEach(async () => {
    contentDir = await mkdtemp(join(tmpdir(), 'dojo-check-'));
  });
  afterEach(() => rm(contentDir, { recursive: true, force: true }));

  it('reports every broken file of the sample content in plain words', async () => {
    await writeContent(contentDir, sampleContent());

    const report = await checkContent(contentDir);

    expect(report).toMatchObject({ katas: 2, cards: 7 });
    expect(formatReport(report).split('\n')).toEqual([
      '2 Katas, 7 Cards, 2 issues.',
      '  - react/mystery-tag: Tag "suspense" is not declared in the Kata\'s kata.md; the Card is kept without it',
      '  - react/no-answer: section "## Answer" is missing; the Card is not shown',
    ]);
  });

  it('reports a clean folder as zero issues', async () => {
    await writeContent(
      contentDir,
      sampleContent().filter((f) => !/mystery-tag|no-answer/.test(f.path)),
    );

    const report = await checkContent(contentDir);

    expect(report.issues).toEqual([]);
    expect(formatReport(report)).toBe('2 Katas, 6 Cards, 0 issues.');
  });
});
