---
difficulty: medium
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties
---

## Question

Does marking a property `readonly` make the object immutable?

## Answer

No. `readonly` only stops that property from being reassigned; what it points to can still change, and it exists only in the type system, so nothing is enforced at runtime.

## Explanation

Handbook: "Using the `readonly` modifier doesn't necessarily imply that a value is totally immutable - or in other words, that its internal contents can't be changed." and "It just means the property itself can't be re-written to." Also: "While it won't change any behavior at runtime, a property marked as readonly can't be written to during type-checking." In the example `home.resident.age++` is allowed while `home.resident = {...}` fails with `Cannot assign to 'resident' because it is a read-only property.` (2540).

```ts
interface Home { readonly resident: { name: string; age: number } }
declare const home: Home;
home.resident.age++;                 // allowed
home.resident = { name: "a", age: 1 }; // error 2540
```

## Best practice

Use `readonly` and `Readonly<T>` for intent at API boundaries. If you need deep immutability, model it explicitly at each level or freeze at runtime.
