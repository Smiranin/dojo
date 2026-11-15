---
difficulty: medium
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/functions.html#overload-signatures-and-the-implementation-signature
---

## Question

If a function has overload signatures and an implementation, which of them can callers see, and what do you prefer to overloads?

## Answer

Callers see only the overload signatures; the implementation signature is hidden. Prefer one signature with union parameter types when that expresses the same thing.

## Explanation

Handbook: "The signature of the _implementation_ is not visible from the outside." With `function fn(x: string): void; function fn() {}` the call `fn()` fails with `Expected 1 arguments, but got 0.` (2554). An implementation that does not match its overloads gives `This overload signature is not compatible with its implementation signature.` (2394). Guidance: "Always prefer parameters with union types instead of overloads when possible".

```ts
function len(s: string): number;
function len(a: unknown[]): number;
function len(x: string | unknown[]) { return x.length; }
// prefer: function len(x: string | unknown[]): number
```

## Best practice

Use overloads only when the return type depends on the argument type in a way a union or generic cannot express; put the most specific signature first.
