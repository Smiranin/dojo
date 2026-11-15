---
difficulty: medium
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces
---

## Question

When do you use `type` and when `interface`?

## Answer

For object shapes they are very close; the key difference is that an interface can be reopened and extended by redeclaring it (declaration merging), while a type alias cannot. The handbook's rule is to use `interface` until you need features from `type`.

## Explanation

Handbook: "the key distinction is that a type cannot be re-opened to add new properties vs an interface which is always extendable." and "If you would like a heuristic, use `interface` until you need to use features from `type`." Declaring `type Window` twice gives `Error: Duplicate identifier 'Window'.`

## Best practice

Pick one convention per codebase. Use `interface` for public object contracts that others may augment, a `type` alias where you want a closed definition or any non-object shape.
