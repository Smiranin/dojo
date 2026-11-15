---
difficulty: easy
tags: [type-system, type-level]
source: https://www.typescriptlang.org/docs/handbook/2/keyof-types.html#the-keyof-type-operator
---

## Question

Given a constant object, how do you get the union of its keys and the union of its value types?

## Answer

`keyof typeof obj` gives the union of keys, and `(typeof obj)[keyof typeof obj]` gives the union of value types. `typeof` in a type position takes the type of a value, `keyof` produces the key union, and indexed access looks up a property type.

## Explanation

Handbook: "The `keyof` operator takes an object type and produces a string or numeric literal union of its keys"; "TypeScript adds a `typeof` operator you can use in a _type_ context to refer to the _type_ of a variable or property"; indexed access: `type I2 = Person[keyof Person]; // string | number | boolean`. `typeof` is only legal on identifiers and their properties.

```ts
const colors = { red: "#f00", green: "#0f0" } as const;
type ColorName = keyof typeof colors;                 // "red" | "green"
type ColorValue = (typeof colors)[keyof typeof colors]; // "#f00" | "#0f0"
```

## Best practice

Derive types from the one runtime source of truth instead of duplicating a union by hand.
