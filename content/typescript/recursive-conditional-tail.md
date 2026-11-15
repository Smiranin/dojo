---
difficulty: hard
tags: [type-level]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types
---

## Question

Why does it matter whether a recursive conditional type calls itself in tail position?

## Answer

Because TypeScript 4.5 performs tail-recursion elimination on conditional types: when a branch is simply another conditional type, the compiler avoids intermediate instantiations and applies much more generous limits. A recursion that combines the result with something else, such as `Char | GetChars<Rest>`, is not optimised, so you use an accumulator helper.

## Explanation

The 4.5 notes: a plain recursive `TrimLeft` "can be useful, but if a string has 50 leading spaces, you'll get an error" (`Type instantiation is excessively deep and possibly infinite.`). "That's why TypeScript 4.5 performs some tail-recursion elimination on conditional types. As long as one branch of a conditional type is simply another conditional type, TypeScript can avoid intermediate instantiations. There are still heuristics to ensure that these types don't go off the rails, but they are much more generous." A type that "uses the result of a conditional type by adding it to a union" is not optimised; the notes give the accumulator form.

```ts
type TrimLeft<T extends string> = T extends ` ${infer Rest}` ? TrimLeft<Rest> : T;
type GetChars<S> = GetCharsHelper<S, never>;
type GetCharsHelper<S, Acc> = S extends `${infer Char}${infer Rest}` ? GetCharsHelper<Rest, Char | Acc> : Acc;
```

## Best practice

Write recursive type helpers in tail-recursive form with an accumulator type parameter, and keep them for jobs such as string parsing where they pay off. The notes say the limits are "much more generous", not what they are.
