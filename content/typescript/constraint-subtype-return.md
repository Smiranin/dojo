---
difficulty: hard
tags: [generics, inference]
source: https://www.typescriptlang.org/docs/handbook/2/functions.html#working-with-constrained-values
---

## Question

Why does this not compile, even though `{ length: minimum }` satisfies the constraint?

```ts
function minimumLength<Type extends { length: number }>(obj: Type, minimum: number): Type {
  if (obj.length >= minimum) return obj;
  return { length: minimum };
}
```

## Answer

The function promises to return the same kind of object that was passed in, not just some object matching the constraint. `Type` could be a subtype with more properties, such as an array, so a bare `{ length }` is not assignable to it.

## Explanation

Handbook: "The problem is that the function promises to return the _same_ kind of object as was passed in, not just _some_ object matching the constraint." The error (2322): `Type '{ length: number; }' is not assignable to type 'Type'. '{ length: number; }' is assignable to the constraint of type 'Type', but 'Type' could be instantiated with a different subtype of constraint '{ length: number; }'.`

## Best practice

If the result does not have to be the caller's type, return the constraint type, or overload the function. Do not silence it with `as Type`, which restates the unsound promise.
