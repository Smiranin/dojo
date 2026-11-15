---
difficulty: easy
tags: [type-system, type-level]
source: https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype
---

## Question

How do you get the type a function returns without writing it out?

## Answer

Use the `ReturnType` utility on the function's type: `ReturnType<typeof fn>`. `Parameters<typeof fn>` does the same for the argument tuple.

## Explanation

Handbook: `ReturnType` "Constructs a type consisting of the return type of function `Type`"; for overloads it is "the return type of the _last_ signature". `Parameters<(s: string) => void>` is `[s: string]`. `typeof` is needed because the utility takes a type, not a value.

```ts
function f() { return { x: 10, y: 3 }; }
type P = ReturnType<typeof f>; // { x: number; y: number }
```

## Best practice

Derive types from functions for internal code so they cannot drift. For a public API prefer an exported named type so the contract is explicit.
