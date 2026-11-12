---
difficulty: hard
tags: [generics, inference, modern]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters
---

## Question

What are the inferred types of the two calls below?

```ts
declare function fnBad<const T extends string[]>(args: T): void;
declare function fnGood<const T extends readonly string[]>(args: T): void;
fnBad(["a", "b", "c"]);
fnGood(["a", "b", "c"]);
```

## Answer

`T` is `string[]` in the first call and `readonly ["a", "b", "c"]` in the second. A `const` type parameter infers like `as const`, but a `readonly` tuple cannot satisfy a mutable `string[]` constraint, so inference falls back to the constraint.

## Explanation

5.0 notes: "you can now add a `const` modifier to a type parameter declaration to cause `const`-like inference to be the default". Caveats: "the `const` modifier doesn't _reject_ mutable values, and doesn't require immutable constraints", and it "only affects inference of object, array and primitive expressions that were written within the call", so passing a variable `const arr = ["a","b","c"]` still gives `string[]`.

## Best practice

Write the constraint as `readonly` when you use `const` type parameters, so callers do not need `as const`.
