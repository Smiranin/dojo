---
difficulty: hard
tags: [type-level]
source: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types
---

## Question

What are `A`, `B` and `C`, and what does `infer` do?

```ts
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
type A = Flatten<string[]>;
type B = Flatten<number>;
type C = FirstIfString<[string, number]>;
type FirstIfString<T> = T extends [infer S extends string, ...unknown[]] ? S : never;
```

## Answer

`A` is `string`, `B` is `number` (the check fails so the false branch returns it), `C` is `string`. `infer` declares a type variable inside the `extends` clause of a conditional type; the checker fills it in from the matching part of the checked type, and since 4.7 you can constrain it with `infer S extends string`.

## Explanation

Handbook: "Conditional types provide us with a way to infer from types we compare against in the true branch using the `infer` keyword." 4.7 notes: "TypeScript 4.7 now allows you to place a constraint on any `infer` type." `infer` is only legal in the `extends` clause of a conditional type.

## Best practice

Prefer the built-ins (`ReturnType`, `Parameters`, `Awaited`) before writing your own `infer` helper, and test helpers with a few type-level assertions.
