import type { ContentIssue } from '@dojo/core';
import { ContentStore } from './content-store.js';

export interface ContentReport {
  katas: number;
  cards: number;
  issues: ContentIssue[];
}

/** One line per issue, written for a person at a terminal (or an agent reading its output). */
export function describeIssue(issue: ContentIssue): string {
  switch (issue.kind) {
    case 'unknown-tag':
      return `${issue.cardId}: Tag "${issue.tag}" is not declared in the Kata's kata.md; the Card is kept without it`;
    case 'missing-section':
      return `${issue.cardId}: section "## ${issue.section}" is missing; the Card is not shown`;
    case 'invalid-front-matter':
      return `${issue.path}: ${issue.message}`;
    case 'invalid-kata':
      return `${issue.kataId}: ${issue.message}; the Kata and its Cards are not shown`;
  }
}

/**
 * Walks a content folder with the same code the server uses and reports what it found. The CLI
 * and the server can never disagree about what a valid Card is.
 */
export async function checkContent(contentDir: string): Promise<ContentReport> {
  const snapshot = await new ContentStore(contentDir).snapshot();
  return { katas: snapshot.katas.length, cards: snapshot.cards.length, issues: snapshot.issues };
}

export function formatReport(report: ContentReport): string {
  const lines = report.issues.map((issue) => `  - ${describeIssue(issue)}`);
  const summary = `${report.katas} Katas, ${report.cards} Cards, ${report.issues.length} issues.`;
  return lines.length === 0 ? summary : `${summary}\n${lines.join('\n')}`;
}
