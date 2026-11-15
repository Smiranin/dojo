---
difficulty: hard
tags: [type-level]
source: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
---

## Question

What are the two results below, and why do they differ?

```ts
type ToArray<Type> = Type extends any ? Type[] : never;
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;
type X = ToArray<string | number>;
type Y = ToArrayNonDist<string | number>;
```

## Answer

`X` is `string[] | number[]` and `Y` is `(string | number)[]`. A conditional type over a naked type parameter distributes over a union, applying the check to each member; wrapping both sides in a tuple turns that off.

## Explanation

Handbook: "When conditional types act on a generic type, they become _distributive_ when given a union type." and "To avoid that behavior, you can surround each side of the `extends` keyword with square brackets." Distribution is also why `Exclude<T, U>` and `Extract<T, U>` work on unions.

## Best practice

Know when a helper will distribute. Use the `[T] extends [U]` form when the check is about the whole union.
