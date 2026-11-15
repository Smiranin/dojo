---
difficulty: hard
tags: [narrowing, modern]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#inferred-type-predicates
---

## Question

In current TypeScript, what are the types of `birds` and `scores`, and why does only one of the `filter` calls narrow?

```ts
declare const countries: string[];
declare const nationalBirds: Map<string, Bird>;
declare const students: string[];
declare const allScores: Map<string, number>;
const birds = countries.map(c => nationalBirds.get(c)).filter(b => b !== undefined);
const scores = students.map(s => allScores.get(s)).filter(x => !!x);
```

## Answer

`birds` is `Bird[]`: since TypeScript 5.5 a function whose single return expression refines its parameter gets an inferred type predicate. `scores` stays `(number | undefined)[]` because `!!x` is not an if-and-only-if test: a `false` result could still be the number `0`.

## Explanation

The 5.5 notes list the conditions: no explicit return type or predicate, a single `return` and no implicit returns, the parameter is not mutated, and the function returns a boolean expression tied to a refinement of the parameter. "Type predicates have "if and only if" semantics." For `!!score` the page explains "if this returns `true` then `score` is a `number`. But if it returns `false`, then `score` could be either `undefined` or a `number` (specifically, `0`)." Fix: `.filter(score => score !== undefined)`. The change can also break code: `[1, 2, 3, null, 5].filter(x => x !== null)` is now `number[]`, so `nums.push(null)` is an error.

## Best practice

Filter with an explicit comparison against `undefined` or `null`, not truthiness. Write a manual `x is T` predicate only when inference does not apply.
