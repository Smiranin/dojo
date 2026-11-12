---
difficulty: medium
tags: [generics]
source: https://www.typescriptlang.org/docs/handbook/2/generics.html#using-type-parameters-in-generic-constraints
---

## Question

How do you type `getProperty(obj, key)` so a wrong key is a compile error and the result has the right type?

## Answer

Give the function two type parameters and constrain the key to the keys of the object: `<Type, Key extends keyof Type>`. The return type `Type[Key]` is then the precise property type, and an unknown key is rejected.

## Explanation

The handbook's "Using Type Parameters in Generic Constraints": "We'd like to ensure that we're not accidentally grabbing a property that does not exist on the `obj`, so we'll place a constraint between the two types". The failing call `getProperty(x, "m")` reports `'"m"' is not assignable to parameter of type '"a" | "b" | "c" | "d"'`.

```ts
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key): Type[Key] {
  return obj[key];
}
```

## Best practice

Constrain type parameters to exactly what the body needs, and let the arguments infer them instead of passing type arguments by hand.
