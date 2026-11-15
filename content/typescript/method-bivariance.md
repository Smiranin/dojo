---
difficulty: hard
tags: [type-system, strictness]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#strict-function-types
---

## Question

`strictFunctionTypes` is on. Why are both assignments allowed for `Comparer`, but would one fail if `compare` were declared as a property with a function type?

```ts
interface Comparer<T> { compare(a: T, b: T): number }
declare let animalComparer: Comparer<Animal>;
declare let dogComparer: Comparer<Dog>;
animalComparer = dogComparer;
dogComparer = animalComparer;
```

## Answer

The strict check applies to function types but not to method or constructor declarations, which stay bivariant. So `Comparer<T>` is bivariant in `T` when `compare` is a method, and with `compare: (a: T, b: T) => number` the `animalComparer = dogComparer` line becomes an error.

## Explanation

2.6 notes: "The stricter checking applies to all function types, _except_ those originating in method or constructor declarations." The reason given: "Methods are excluded specifically to ensure generic classes and interfaces (such as `Array<T>`) continue to mostly relate covariantly." and "Effectively, `T` is bivariant in `Comparer<T>` because it is used only in method parameter positions."

## Best practice

Declare callbacks and handlers as properties with function types when you want the strict check, and methods when you want the lenient `Array`-like behaviour.
