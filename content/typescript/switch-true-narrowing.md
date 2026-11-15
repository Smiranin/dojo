---
difficulty: medium
tags: [narrowing, modern]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-3.html#switch-true-narrowing
---

## Question

What does the compiler know about `x` in each `case` here?

```ts
function f(x: unknown) {
  switch (true) {
    case typeof x === "string":
      console.log(x.toUpperCase());
    // falls through
    case Array.isArray(x):
      console.log(x.length);
    // falls through
    default:
  }
}
```

## Answer

Since TypeScript 5.3 each `case` expression narrows as a condition. `x` is a `string` in the first case, `string | any[]` in the second because of the fallthrough, and `unknown` in `default`.

## Explanation

This is the page's own example (5.3, "`switch (true)` narrowing"). The checker applies the conditions of the case clauses as if they were an `if`/`else if` chain, merging at fallthroughs.

## Best practice

Use it when a chain of different kinds of checks reads better as a `switch`. Add `break` or `return` to avoid the merged types of fallthrough.
