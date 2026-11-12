---
difficulty: medium
tags: [type-system, inference, modern]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator
---

## Question

What is the type of `palette.green` here, and what would it be with a type annotation instead of `satisfies`?

```ts
type Colors = "red" | "green" | "blue";
type RGB = [red: number, green: number, blue: number];
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
  blue: [0, 0, 255],
} satisfies Record<Colors, string | RGB>;
```

## Answer

With `satisfies` it is `string`, so `palette.green.toUpperCase()` works. With `const palette: Record<Colors, string | RGB>` every property would be `string | RGB` and you would have to narrow first. `satisfies` validates the expression against a type without changing its inferred type.

## Explanation

4.9 notes: "The new `satisfies` operator lets us validate that the type of an expression matches some type, without changing the resulting type of that expression." It also still reports typos and missing keys (here a key outside `Colors` or a missing one is an error).

## Best practice

Use `satisfies` for config objects and lookup tables where you want both checking and precise inferred types; use an annotation when you want the wider type.
