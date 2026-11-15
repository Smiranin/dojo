---
difficulty: medium
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/type-compatibility.html
---

## Question

I pass an instance of a class `Dog` to a function that takes the interface `Pet`, and `Dog` never says `implements Pet`. Why does that compile?

## Answer

TypeScript compares types by their structure, not their names: a value is assignable to a type if it has at least the members that type requires, so `Dog` with a `name` fits `Pet`. The one exception is classes with `private` or `protected` members, which must come from the same declaration.

## Explanation

Handbook: "Type compatibility in TypeScript is based on structural subtyping." and "The basic rule for TypeScript's structural type system is that `x` is compatible with `y` if `y` has at least the same members as `x`." For private and protected members: "if the target type contains a private member, then the source type must also contain a private member that originated from the same class." Generic type parameters matter only when they appear in a member: `interface Empty<T> {}` values are interchangeable for any `T`, `interface NotEmpty<T> { data: T }` are not.

```ts
interface Pet { name: string }
class Dog { name = "Rex"; }
const pet: Pet = new Dog(); // fine
```

## Best practice

Design types by shape. When two shapes must not be mixed up, give them a discriminating member (for example a literal `kind`) or a `private` member.
