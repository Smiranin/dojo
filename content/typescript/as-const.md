---
difficulty: easy
tags: [type-system, inference]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
---

## Question

What does `as const` do, and what do you use it for?

## Answer

It makes the expression's type as narrow as possible: literals stay literal, object properties become `readonly` and arrays become readonly tuples. I use it to keep fixed data precise and to derive union types from it.

## Explanation

TypeScript 3.4 introduced const assertions: `let y = [10, 20] as const;` has type `readonly [10, 20]`. The handbook's "Objects vs Enums" section shows the common use, an object whose values become a union.

```ts
const ODirection = { Up: 0, Down: 1, Left: 2, Right: 3 } as const;
type Direction = typeof ODirection[keyof typeof ODirection]; // 0 | 1 | 2 | 3
```

## Best practice

Prefer `as const` objects plus a derived union over runtime enums for plain sets of constants (see card `enum-vs-const-object`).
