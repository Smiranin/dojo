---
difficulty: easy
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/functions.html#unknown
---

## Question

What's the difference between `any` and `unknown`, and which do you reach for at a system boundary?

## Answer

Both accept any value, but `any` turns checking off for it, while `unknown` forces you to narrow before you do anything with the value. `unknown` is the type-safe top type, so I use it for external input and narrow it.

## Explanation

The handbook: "The `unknown` type represents _any_ value. This is similar to the `any` type, but is safer because it's not legal to do anything with an `unknown` value". Calling `a.b()` on an `unknown` is error 18046 (`'a' is of type 'unknown'.`), on `any` it is allowed. Narrowing with `typeof`, `instanceof`, a type predicate or a schema check turns it into a usable type.

```ts
function f1(a: any) { a.b(); }      // compiles, may throw
function f2(a: unknown) { a.b(); }  // error 18046
```

## Best practice

Type `JSON.parse` results, `catch` variables and untrusted input as `unknown` and narrow. Keep `any` for code you are migrating; the declaration-file guide says not to use `any` "unless you are in the process of migrating a JavaScript project to TypeScript".
