---
difficulty: hard
tags: [inference, modern]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html#less-context-sensitivity-on-this-less-functions
---

## Question

Does this call compile in TypeScript 6.0 and 7.0, and why did it fail before 6.0?

```ts
declare function callIt<T>(obj: { produce: (x: number) => T; consume: (y: T) => void }): void;
callIt({
  consume(y) { return y.toFixed(); },
  produce(x: number) { return x * 2; },
});
```

## Answer

It compiles from 6.0 on. A function that never uses `this` is no longer treated as context-sensitive, so the checker can infer `T` from `produce` first even though `consume` is written first. Before, method syntax made it context-sensitive and `y` was `unknown`.

## Explanation

6.0 notes: "If `this` is never actually _used_ in a function, then it is not considered contextually sensitive." The old behaviour on this call was `error: 'y' is of type 'unknown'.`, while the page shows the arrow-function form of the same call compiling in either property order. TypeScript 7.0 compiles identically to 6.0 for code that compiles cleanly on 6.0.

## Best practice

Order does not matter for this now, but if inference still fails give an explicit parameter type or type argument.
