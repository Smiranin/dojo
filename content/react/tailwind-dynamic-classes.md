---
difficulty: easy
tags: [styling]
source: https://tailwindcss.com/docs/detecting-classes-in-source-files
---

## Question

The badge never turns red or green, though the class name looks right. What is the bug?

```tsx
function Badge({ tone }: { tone: 'red' | 'green' }) {
  return <span className={`text-${tone}-600`}>Status</span>;
}
```

## Answer

Tailwind finds classes by scanning source for complete class-name strings, and it cannot follow string interpolation, so `text-red-600` and `text-green-600` never appear in the source and no CSS is generated. Write complete names, for example through a lookup object.

## Explanation

The scanner treats files as plain text. Fixes: map props to full class strings; for truly dynamic values use inline styles or CSS variables; or safelist with `@source inline("text-red-600")`.

```tsx
const tones = { red: 'text-red-600', green: 'text-green-600' } as const;
return <span className={tones[tone]}>Status</span>;
```

## Best practice

Never build class names by concatenation; keep a variant map.
