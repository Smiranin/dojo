---
difficulty: hard
tags: [type-system, generics, strictness]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#strict-function-types
---

## Question

With `strictFunctionTypes` on, which of these assignments is an error, and what is the rule behind it?

```ts
declare let f1: (x: Animal) => void;
declare let f2: (x: Dog) => void;
declare let f3: (x: Cat) => void;
f1 = f2;
f2 = f1;
f2 = f3;
```

## Answer

`f1 = f2` and `f2 = f3` are errors; `f2 = f1` is fine. Function parameters are contravariant: a function that accepts any `Animal` can stand in for one that only gets `Dog`s, but not the reverse.

## Explanation

2.6 notes: "The first assignment is permitted in default type checking mode, but flagged as an error in strict function types mode." The same notes say "The `strictFunctionTypes` switch is part of the `strict` family of switches, meaning that it defaults to on in strict mode", and `strict` is `true` by default in 6.0 and 7.0 (6.0 and 7.0 announcements). The handbook describes the older default: assignment succeeds "if either the source parameter is assignable to the target parameter, or vice versa", and the flag raises errors for that unsoundness.

## Best practice

Keep `strictFunctionTypes` on (it is in `strict`). Where you really need a callback that accepts a wider type, declare it with the wider parameter type rather than relying on bivariance.
