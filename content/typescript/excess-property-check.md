---
difficulty: medium
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/objects.html#excess-property-checks
---

## Question

Which of these two calls does the compiler reject, and why not the other?

```ts
interface SquareConfig { color?: string; width?: number }
declare function createSquare(c: SquareConfig): void;
createSquare({ colour: "red", width: 100 });
const opts = { colour: "red", width: 100 };
createSquare(opts);
```

## Answer

The first call fails because object literals passed directly get excess property checking, and `colour` is not a known property. The second passes since `opts` is not a fresh literal and has the required overlap (`width`), so it is only checked structurally.

## Explanation

Handbook: "Object literals get special treatment and undergo _excess property checking_ when assigning them to other variables, or passing them as arguments." The error is `Object literal may only specify known properties, but 'colour' does not exist in type 'SquareConfig'. Did you mean to write 'color'?` (2561). If the variable had no properties in common with the all-optional target, the error would be `Type '{ colour: string; }' has no properties in common with type 'SquareConfig'.` (2559).

## Best practice

Treat the excess-property error as a typo detector. If extra properties are legitimate, say so in the type with an index signature rather than with `as SquareConfig`.
