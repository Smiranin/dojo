---
difficulty: hard
tags: [generics, inference, modern]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type
---

## Question

This function should only accept a default that is one of the given colors, but this call compiles. Why, and how do you fix it?

```ts
function createStreetLight<C extends string>(colors: C[], defaultColor?: C) {}
createStreetLight(["red", "yellow", "green"], "blue");
```

## Answer

`defaultColor` is also an inference site for `C`, so `"blue"` becomes a candidate and `C` widens to include it. Wrapping the parameter in `NoInfer<C>` (TypeScript 5.4) excludes it from inference, so `C` comes only from `colors` and `"blue"` is rejected.

## Explanation

5.4 notes: "In this call, type inference decided that `"blue"` was just as valid of a type as `"red"` or `"yellow"` or `"green"`." and "Surrounding a type in `NoInfer<...>` gives a signal to TypeScript not to dig in and match against the inner types to find candidates for type inference." Error with the fix: `Argument of type '"blue"' is not assignable to parameter of type '"red" | "yellow" | "green" | undefined'.` The old workaround was a second parameter `D extends C`.

```ts
function createStreetLight<C extends string>(colors: C[], defaultColor?: NoInfer<C>) {}
```

## Best practice

Use `NoInfer` on parameters that should be checked against, not contribute to, a type parameter (defaults, initial values, comparison targets).
