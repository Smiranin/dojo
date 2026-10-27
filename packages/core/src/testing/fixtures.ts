/**
 * Sample content as strings: two Katas and eight Cards, one with a Tag the Kata does not
 * declare and one without `## Answer`. Server tests write them to a temp dir; web tests serve
 * them through msw; core tests parse them directly.
 */
export interface FixtureFile {
  /** Relative to the content root, e.g. `react/kata.md`. */
  path: string;
  text: string;
}

export const REACT_KATA = `---
title: React
description: Hooks, rendering, state management and performance.
tags: [hooks, rendering, state-management, performance]
pinned: true
archived: false
---

Owner notes stay here and the Dojo ignores them.
`;

export const PYTHON_KATA = `---
title: Python
description: The language, its data model and the standard library.
tags: [data-model, async, typing]
pinned: false
archived: false
---
`;

function card(
  front: string,
  question: string,
  answer: string,
  rest: { explanation?: string; bestPractice?: string } = {},
): string {
  const parts = [
    `---\n${front}\n---\n`,
    `## Question\n\n${question}\n`,
    `## Answer\n\n${answer}\n`,
  ];
  if (rest.explanation) parts.push(`## Explanation\n\n${rest.explanation}\n`);
  if (rest.bestPractice) parts.push(`## Best practice\n\n${rest.bestPractice}\n`);
  return parts.join('\n');
}

export const REACT_CARDS: FixtureFile[] = [
  {
    path: 'react/use-memo.md',
    text: card(
      'difficulty: medium\ntags: [hooks, performance]\nsource: https://react.dev/reference/react/useMemo',
      'When does `useMemo` actually help, and when is it noise?',
      'It helps when the computation is expensive or when referential stability of the result matters to a memoized child or an effect dependency. Otherwise it is noise.',
      {
        explanation:
          'React re-runs the component body on every render; `useMemo` trades a dependency comparison for skipping the computation.',
        bestPractice: 'Measure first; reach for `useMemo` when a profile shows the computation.',
      },
    ),
  },
  {
    path: 'react/keys.md',
    text: card(
      'difficulty: easy\ntags: [rendering]',
      'Why must list items have stable keys?',
      'Keys let React match elements between renders so state and DOM nodes follow the item instead of the position.',
    ),
  },
  {
    path: 'react/stale-closure.md',
    text: card(
      'difficulty: hard\ntags: [hooks]',
      'What is a stale closure in an effect and how do you avoid it?',
      "A callback captured an old render's variables. List the dependency, use a ref, or use the functional updater.",
      {
        explanation: `Each render has its own scope:

\`\`\`tsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []);
\`\`\`

\`count\` is frozen at 0 here.`,
      },
    ),
  },
  {
    path: 'react/context-rerender.md',
    text: card(
      'difficulty: medium\ntags: [state-management, performance]',
      'What happens to consumers when a context value changes?',
      'Every consumer re-renders, regardless of memoization between the provider and the consumer.',
    ),
  },
  {
    path: 'react/mystery-tag.md',
    text: card(
      'difficulty: easy\ntags: [rendering, suspense]',
      'What does a Suspense boundary do during a transition?',
      'It keeps the old UI visible instead of showing the fallback.',
    ),
  },
  {
    path: 'react/no-answer.md',
    text: `---
difficulty: easy
tags: [hooks]
---

## Question

What does \`useRef\` return?
`,
  },
];

export const PYTHON_CARDS: FixtureFile[] = [
  {
    path: 'python/gil.md',
    text: card(
      'difficulty: medium\ntags: [async]',
      'What does the GIL protect and what does it not?',
      'It protects the interpreter state; it does not protect your data between bytecode boundaries.',
    ),
  },
  {
    path: 'python/dunder-eq-hash.md',
    text: card(
      'tags: [data-model]',
      'Why must `__hash__` be defined when `__eq__` is?',
      'Equal objects must hash equally; defining `__eq__` alone sets `__hash__` to None.',
    ),
  },
];

export function sampleContent(): FixtureFile[] {
  return [
    { path: 'react/kata.md', text: REACT_KATA },
    { path: 'python/kata.md', text: PYTHON_KATA },
    ...REACT_CARDS,
    ...PYTHON_CARDS,
  ];
}
