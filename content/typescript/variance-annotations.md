---
difficulty: hard
tags: [generics, type-system]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#optional-variance-annotations-for-type-parameters
---

## Question

What are `in` and `out` on a type parameter, and when would you write them?

## Answer

Variance annotations, added in TypeScript 4.7, state explicitly how a generic type relates to its parameter: `out T` is covariant (T only produced), `in T` is contravariant (T only consumed). You write them to make the intended variance explicit and checked.

## Explanation

4.7 notes: "With TypeScript 4.7, we're now able to _explicitly_ specify variance on type parameters." Examples: `type Getter<out T> = () => T;` and `type Setter<in T> = (value: T) => void;`. By default the checker works out variance from how the parameter is used (see also `method-bivariance`).

```ts
type Getter<out T> = () => T;
type Setter<in T> = (value: T) => void;
```

## Best practice

Add annotations on public generic types whose variance is part of the contract, so a later edit that breaks it is an error.
