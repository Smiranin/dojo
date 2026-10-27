import { describe, expect, it } from 'vitest';
import {
  parseCardFile,
  parseKataFile,
  serializeCardFile,
  serializeKataFile,
  slugify,
  splitSections,
} from '../src/index.js';
import { PYTHON_KATA, REACT_CARDS, REACT_KATA } from '../src/testing/index.js';

const REACT_TAGS = ['hooks', 'rendering', 'state-management', 'performance'];

function fixture(path: string): string {
  const file = REACT_CARDS.find((f) => f.path === path);
  if (!file) throw new Error(`No fixture ${path}`);
  return file.text;
}

describe('parseKataFile', () => {
  it('reads the front matter and keeps the body verbatim', () => {
    const parsed = parseKataFile(REACT_KATA, 'react');

    expect(parsed.kata).toEqual({
      id: 'react',
      title: 'React',
      description: 'Hooks, rendering, state management and performance.',
      tags: REACT_TAGS,
      pinned: true,
      archived: false,
    });
    expect(parsed.body).toContain('Owner notes stay here');
    expect(parsed.issues).toEqual([]);
  });

  it('reports a Kata without a title instead of throwing', () => {
    const fileWithoutTitle = '---\ndescription: nothing\n---\n';

    const parsed = parseKataFile(fileWithoutTitle, 'empty');

    expect(parsed.kata).toBeNull();
    expect(parsed.issues[0]?.kind).toBe('invalid-kata');
  });

  it('round-trips a Kata file written by the Dojo, notes included', () => {
    const parsed = parseKataFile(REACT_KATA, 'react');

    const written = serializeKataFile(parsed.kata!, parsed.body);

    expect(written).toBe(REACT_KATA);
    expect(serializeKataFile(parseKataFile(PYTHON_KATA, 'python').kata!)).toBe(PYTHON_KATA);
  });
});

describe('parseCardFile', () => {
  it('reads all four sections and the front matter', () => {
    const parsed = parseCardFile(fixture('react/use-memo.md'), 'react', 'use-memo', REACT_TAGS);

    expect(parsed.issues).toEqual([]);
    expect(parsed.card).toMatchObject({
      id: 'react/use-memo',
      kataId: 'react',
      slug: 'use-memo',
      difficulty: 'medium',
      tags: ['hooks', 'performance'],
      source: 'https://react.dev/reference/react/useMemo',
      question: 'When does `useMemo` actually help, and when is it noise?',
    });
    expect(parsed.card?.explanation).toContain('dependency comparison');
    expect(parsed.card?.bestPractice).toContain('Measure first');
  });

  it('leaves optional sections and difficulty absent when the file has none', () => {
    const parsed = parseCardFile(
      '---\ntags: [hooks]\n---\n\n## Question\n\nQ?\n\n## Answer\n\nA.\n',
      'react',
      'minimal',
      REACT_TAGS,
    );

    expect(parsed.card).toEqual({
      id: 'react/minimal',
      kataId: 'react',
      slug: 'minimal',
      question: 'Q?',
      answer: 'A.',
      tags: ['hooks'],
    });
  });

  it('excludes a Card without an Answer and says which section is missing', () => {
    const parsed = parseCardFile(fixture('react/no-answer.md'), 'react', 'no-answer', REACT_TAGS);

    expect(parsed.card).toBeNull();
    expect(parsed.issues).toEqual([
      { kind: 'missing-section', cardId: 'react/no-answer', section: 'Answer' },
    ]);
  });

  it('drops a Tag the Kata does not declare and reports it', () => {
    const parsed = parseCardFile(
      fixture('react/mystery-tag.md'),
      'react',
      'mystery-tag',
      REACT_TAGS,
    );

    expect(parsed.card?.tags).toEqual(['rendering']);
    expect(parsed.issues).toEqual([
      { kind: 'unknown-tag', cardId: 'react/mystery-tag', tag: 'suspense' },
    ]);
  });

  it('keeps a heading-like line inside a code fence as part of the section', () => {
    const fileWithFencedHeading =
      '---\ntags: []\n---\n\n## Question\n\nQ?\n\n## Answer\n\n```md\n## Not a section\n```\n';

    const parsed = parseCardFile(fileWithFencedHeading, 'react', 'fenced', REACT_TAGS);

    expect(parsed.card?.answer).toBe('```md\n## Not a section\n```');
  });

  it('matches section headings case-insensitively', () => {
    const fileWithLowerCaseHeadings = '---\n---\n\n## question\n\nQ?\n\n## ANSWER\n\nA.\n';

    const parsed = parseCardFile(fileWithLowerCaseHeadings, 'react', 'casing', REACT_TAGS);

    expect(parsed.card?.question).toBe('Q?');
    expect(parsed.card?.answer).toBe('A.');
  });

  it('round-trips every Card the Dojo writes, code fences included', () => {
    for (const file of REACT_CARDS.filter((f) => f.path !== 'react/mystery-tag.md')) {
      const slug = file.path.replace('react/', '').replace('.md', '');
      const parsed = parseCardFile(file.text, 'react', slug, REACT_TAGS);
      if (!parsed.card) continue;

      const written = serializeCardFile(parsed.card);

      expect(written, file.path).toBe(file.text);
    }
  });

  it('rejects an unknown difficulty with a front-matter issue', () => {
    const fileWithBadDifficulty =
      '---\ndifficulty: brutal\n---\n\n## Question\n\nQ\n\n## Answer\n\nA\n';

    const parsed = parseCardFile(fileWithBadDifficulty, 'react', 'bad', REACT_TAGS);

    expect(parsed.card).toBeNull();
    expect(parsed.issues[0]?.kind).toBe('invalid-front-matter');
  });
});

describe('splitSections', () => {
  it('returns an empty map for a body without level-2 headings', () => {
    expect(splitSections('# Title\n\ntext')).toEqual(new Map());
  });
});

describe('slugify', () => {
  it('lower-cases, strips accents and punctuation and joins with single hyphens', () => {
    expect(slugify('  Why `useMemo`?  Café — rules!! ')).toBe('why-usememo-cafe-rules');
  });

  it('caps the length without leaving a trailing hyphen', () => {
    const oneOverTheCap = 'a'.repeat(59) + ' b';

    expect(slugify(oneOverTheCap)).toBe('a'.repeat(59));
  });
});
