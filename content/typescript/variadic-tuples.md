---
difficulty: hard
tags: [type-level, generics]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types
---

## Question

How do you type a function that concatenates two tuples and keeps the exact element types?

## Answer

Use generic spreads in tuple types (variadic tuple types, TypeScript 4.0): `<T extends readonly unknown[], U extends readonly unknown[]>(a: T, b: U): [...T, ...U]`. The result is a tuple whose elements are those of `T` followed by those of `U`.

## Explanation

4.0 notes: "The first change is that spreads in tuple type syntax can now be generic." Tuple elements can be labelled (`type Range = [start: number, end: number]`), and since 4.2 rest elements can occur anywhere in a tuple (`[...string[], number]`).

```ts
type Arr = readonly any[];
function concat<T extends Arr, U extends Arr>(arr1: T, arr2: U): [...T, ...U] {
  return [...arr1, ...arr2];
}
```

## Best practice

Use variadic tuples for typed argument lists, `bind`/`pipe` style helpers and `Parameters`-like utilities, with labelled elements to keep editor hints readable.
