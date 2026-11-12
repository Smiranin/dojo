---
difficulty: medium
tags: [type-level]
source: https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype
---

## Question

What does the `Awaited` type do, and where does it show up?

## Answer

It recursively unwraps promise-like types the way `await` does, so `Awaited<Promise<Promise<number>>>` is `number`. It models `await` and `.then()` and is what you combine with `ReturnType` to get the resolved value of an async function.

## Explanation

Handbook: "This type is meant to model operations like `await` in `async` functions, or the `.then()` method on `Promise`s - specifically, the way that they recursively unwrap `Promise`s." It was introduced in TypeScript 4.5. A non-promise type passes through unchanged.

```ts
async function load() { return { id: 1 }; }
type Loaded = Awaited<ReturnType<typeof load>>; // { id: number }
```

## Best practice

Use `Awaited<ReturnType<typeof fn>>` to name the result of an async function instead of repeating its shape.
