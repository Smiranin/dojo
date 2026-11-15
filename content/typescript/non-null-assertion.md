---
difficulty: easy
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-
---

## Question

What does a trailing `!` do in `user!.name`, and why is it a smell?

## Answer

It tells the compiler the value is not `null` or `undefined`. It is only a type assertion with no runtime check, so if you are wrong you get a `TypeError` at runtime.

## Explanation

The handbook: "Writing `!` after any expression is effectively a type assertion that the value isn't `null` or `undefined`" and "it's important to only use `!` when you know that the value can't be `null` or `undefined`." Example: `function liveDangerously(x?: number | null) { console.log(x!.toFixed()); }` compiles with no error.

## Best practice

Narrow (`if (user)`), use `?.` or `??`, or write an assertion function that throws a clear error. Reserve `!` for cases a reviewer can verify locally.
