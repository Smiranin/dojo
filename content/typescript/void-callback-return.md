---
difficulty: hard
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/functions.html#return-type-void
---

## Question

Which of these fail to compile, and why does the first one not?

```ts
type voidFunc = () => void;
const f1: voidFunc = () => { return true; };
function f2(): void { return true; }
```

## Answer

Only `f2` fails. A contextual type with a `void` return does not force the function to return nothing, so a callback may return a value that the caller ignores. A function literal declared with its own `void` return type must not return anything.

## Explanation

Handbook: "Contextual typing with a return type of `void` does **not** force functions to **not** return something." and "when a literal function definition has a `void` return type, that function must **not** return anything." Also "`void` is not the same as `undefined`."

## Best practice

Type callbacks whose result is ignored as returning `void`, not `any`, as the declaration-file guide says.
