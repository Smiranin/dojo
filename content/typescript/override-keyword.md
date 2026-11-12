---
difficulty: easy
tags: [classes, strictness]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-3.html#override-and-the---noimplicitoverride-flag
---

## Question

What does the `override` keyword and `noImplicitOverride` give you?

## Answer

`override` marks a method as overriding a base-class member, so the compiler errors if the base method is renamed or removed. With `noImplicitOverride` it becomes an error to override a method without writing `override`.

## Explanation

4.3 notes: "That's why TypeScript 4.3 adds the `override` keyword." and with the flag "it becomes an error to override any method from a superclass unless you explicitly use an `override` keyword." The tsconfig reference describes it as ensuring "that the sub-classes never go out of sync".

```ts
class SpecializedComponent extends SomeComponent { override show() { } }
```

## Best practice

Turn on `noImplicitOverride`; it is a separate flag from the `override` keyword, introduced together with it in 4.3.
