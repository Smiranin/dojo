---
difficulty: medium
tags: [narrowing]
source: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
---

## Question

A teammate adds `Triangle` to the `Shape` union. How does this code tell you which `switch` you forgot to update?

```ts
function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```

## Answer

In `default`, `shape` is narrowed to what is left of the union, which is `never` while every member is handled. After adding `Triangle` the leftover type is `Triangle`, assigning it to `never` fails, and the compiler points at this function.

## Explanation

Handbook: "The `never` type is assignable to every type; however, no type is assignable to `never` (except `never` itself)." The error after the change is `Type 'Triangle' is not assignable to type 'never'.` (2322). `never` also appears when "TypeScript determines there's nothing left in a union".

## Best practice

End every switch over a union with an exhaustiveness check, ideally a small `assertNever(x: never): never` helper that also throws at runtime for data that bypassed the types.
