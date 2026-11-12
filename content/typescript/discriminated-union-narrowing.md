---
difficulty: medium
tags: [narrowing, type-system]
source: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
---

## Question

Why does `shape.radius` fail here, and what do you change so it works?

```ts
interface Shape { kind: "circle" | "square"; radius?: number; sideLength?: number }
function getArea(shape: Shape) {
  if (shape.kind === "circle") return Math.PI * shape.radius ** 2;
}
```

## Answer

`radius` is optional, so it is `number | undefined`, and checking `kind` does not change that because the type is not a union. Model it as a union of object types that share a literal `kind`; then checking `kind` narrows to the right member.

## Explanation

Handbook: "When every type in a union contains a common property with literal types, TypeScript considers that to be a _discriminated union_, and can narrow out the members of the union." The non-discriminated attempt errors with `'shape.radius' is possibly 'undefined'.` (18048). Since 4.6 narrowing also works when you destructure the discriminant and the payload into `const`s.

```ts
interface Circle { kind: "circle"; radius: number }
interface Square { kind: "square"; sideLength: number }
type Shape = Circle | Square;
function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "square": return shape.sideLength ** 2;
  }
}
```

## Best practice

Model states as discriminated unions instead of one type with optional fields, so impossible combinations are unrepresentable.
