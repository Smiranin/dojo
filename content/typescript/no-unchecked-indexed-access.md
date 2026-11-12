---
difficulty: medium
tags: [strictness]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#checked-indexed-accesses---nouncheckedindexedaccess
---

## Question

What does `noUncheckedIndexedAccess` change, and what does it cost you?

## Answer

It adds `undefined` to the result of property and index access through index signatures and arrays, so `arr[0]` becomes `T | undefined` and you have to check it. The cost is a check on every lookup; the gain is that a missing key is no longer typed as present.

## Explanation

The 4.1 notes: "That's why TypeScript 4.1 ships with a new flag called `noUncheckedIndexedAccess`. Under this new mode, every property access (like `foo.bar`) or indexed access (like `foo["bar"]`) is considered potentially undefined." The reference describes it as adding `undefined` "to any un-declared field in the type". The cost is more narrowing in loops and lookups; the gain is that a missing key is no longer typed as present.

```ts
const scores: Record<string, number> = {};
const s = scores["ann"]; // number | undefined with the flag
```

## Best practice

Enable it on new projects and handle the `undefined` with a check or `??`; use `for...of` and `.at()`-style code where it avoids index reads.
