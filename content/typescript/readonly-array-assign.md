---
difficulty: easy
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/objects.html#the-readonlyarray-type
---

## Question

Why can't you assign a `readonly string[]` to a `string[]`, but the reverse works?

## Answer

A readonly array has no mutating methods, so a mutable array can safely be used as one, but not the other way around, because the callee could then mutate something the owner declared read-only.

## Explanation

Handbook: "The `ReadonlyArray` is a special type that describes arrays that shouldn't be changed." `values.push("hello!")` on a `readonly string[]` gives `Property 'push' does not exist on type 'readonly string[]'.` (2339), and assigning it to a mutable array gives `The type 'readonly string[]' is 'readonly' and cannot be assigned to the mutable type 'string[]'.` (4104). The `readonly string[]` syntax arrived in TypeScript 3.4.

## Best practice

Type function parameters that you only read as `readonly T[]`, so callers can pass either kind.
