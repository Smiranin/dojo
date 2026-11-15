---
difficulty: medium
tags: [narrowing]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
---

## Question

What is an assertion function, and how is it different from a type predicate?

## Answer

A function with an `asserts` return type, such as `asserts val is string`, that throws if the condition is false. After a call returns normally, the compiler treats the condition as true for the rest of the scope, whereas a predicate returns a boolean that you branch on.

## Explanation

3.7 release notes: "`asserts condition` says that whatever gets passed into the `condition` parameter must be true if the `assert` returns". The form `asserts val is string` narrows the argument.

```ts
function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== "string") throw new Error("Not a string!");
}
function f(x: unknown) { assertIsString(x); x.toUpperCase(); }
```

## Best practice

Use them for invariants and input validation where failing is the only sensible outcome; make the function really throw, since the compiler trusts the signature.
