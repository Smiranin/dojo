---
difficulty: hard
tags: [generics, inference]
source: https://www.typescriptlang.org/docs/handbook/2/functions.html#specifying-type-arguments
---

## Question

Why does this call fail, and how do you make it work?

```ts
function combine<Type>(arr1: Type[], arr2: Type[]): Type[] {
  return arr1.concat(arr2);
}
combine([1, 2, 3], ["hello"]);
```

## Answer

`Type` gets candidates `number` and `string` from the two arguments, inference settles on one, and the other argument is then not assignable. If you really want the union, specify it: `combine<string | number>(...)`.

## Explanation

Handbook (`#specifying-type-arguments`): the unannotated call errors with `Type 'string' is not assignable to type 'number'.` (2322), and "If you intended to do this, however, you could manually specify `Type`" as `combine<string | number>([1, 2, 3], ["hello"])`. The error text shows the call failing on the second argument unless the union is given explicitly.

## Best practice

Treat this error as a signal about the function's design. Use two type parameters when the arguments are independent, and a block on inference (card `noinfer`) when one parameter should only be checked.
