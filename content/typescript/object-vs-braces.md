---
difficulty: medium
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/functions.html#object
---

## Question

What's the difference between `object`, `{}` and `Object` as types?

## Answer

`object` means any non-primitive value. `{}` is the empty object type and `Object` is the global interface of `Object.prototype`; both accept primitives too, and you should avoid both. Use `object`, `unknown` or a real shape.

## Explanation

Handbook: "`object` is not `Object`. **Always** use `object`!" and `object` is "different from the _empty object type_ `{ }`, and also different from the global type `Object`". The declaration-file guide: "Instead of `Object`, use the non-primitive `object` type". `{}` excludes `null` and `undefined` (TypeScript 4.8 reports an error when an unconstrained type parameter is used where `null` or `undefined` are not legal).

## Best practice

Accept `unknown` when you take anything, `Record<string, unknown>` for a bag of properties, `object` to exclude primitives. Do not write `Object` or `Function` types; use `() => void` or a signature for callbacks.
