---
difficulty: medium
tags: [type-level]
source: https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
---

## Question

What are template literal types and what do `Uppercase` and `Capitalize` do with them?

## Answer

Types that use template string syntax in a type position to build string literal types; with a union in the placeholder they produce every combination. `Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize` are built-in types that transform a string literal type, and the compiler can also infer from a template pattern.

## Explanation

Handbook: "They have the same syntax as template literal strings in JavaScript, but are used in type positions." `` `hello ${World}` `` is `"hello world"`. "When a union is used in the interpolated position, the type is the set of every possible string literal". Inference: matching `` `${Key}Changed` `` against `"firstNameChanged"` infers `Key` as `"firstName"`. The intrinsic types "are not locale aware". Introduced in 4.1.

```ts
type PropEventSource<Type> = {
  on<Key extends string & keyof Type>(eventName: `${Key}Changed`, callback: (v: Type[Key]) => void): void;
};
```

## Best practice

Use them to type string conventions (event names, route params), not to parse arbitrary strings, where recursive types get slow and hard to maintain.
