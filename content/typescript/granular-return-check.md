---
difficulty: medium
tags: [type-system, modern]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html#granular-checks-for-branches-in-return-expressions
---

## Question

What does TypeScript report for this function, and which release made that possible?

```ts
declare const untypedCache: Map<string, any>;
function getUrlObject(urlString: string): URL {
  return untypedCache.has(urlString) ? untypedCache.get(urlString) : urlString;
}
```

## Answer

It reports `Type 'string' is not assignable to type 'URL'` on the `urlString` branch. Since TypeScript 5.8 each branch of a conditional expression directly in a `return` is checked against the declared return type; before, the `any` in one branch swallowed the whole expression.

## Explanation

5.8 notes: "the type system special-cases conditional expressions directly inside `return` statements. Each branch of the conditional is checked against the declared return type of the containing functions (if one exists)". Without a declared return type there is nothing to check against.

## Best practice

Declare return types on exported functions; with `any` flowing through a ternary you now get the check for free.
