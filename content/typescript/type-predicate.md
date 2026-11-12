---
difficulty: medium
tags: [narrowing]
source: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
---

## Question

What is a type predicate, and what does the compiler check about it?

## Answer

A return type of the form `x is T` that makes a function a custom type guard: when it returns `true`, the argument is narrowed to `T` at the call site. The compiler does not verify the body, so a wrong predicate is a lie the checker believes.

## Explanation

Handbook: "A predicate takes the form `parameterName is Type`, where `parameterName` must be the name of a parameter from the current function signature." The semantics are "if and only if": returning `true` means `x` has type `T`, returning `false` means it does not (5.5 release notes). 

```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
```

## Best practice

Write predicates that check everything the type promises, and cover both branches. Since 5.5 you often need none, see `inferred-type-predicate`.
