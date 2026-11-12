---
difficulty: hard
tags: [strictness, type-system]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#exact-optional-property-types---exactoptionalpropertytypes
---

## Question

With `exactOptionalPropertyTypes` on, which line fails, and how do you allow it?

```ts
interface Person { name: string; age?: number }
const p: Person = { name: "Daniel", age: undefined };
```

## Answer

The assignment fails. The flag makes optional properties mean "may be absent", not "may be `undefined`". To allow an explicit `undefined`, write `age?: number | undefined`.

## Explanation

4.4 notes: "the new flag `exactOptionalPropertyTypes` specifies that optional property types should be interpreted exactly as written", and `age: undefined` is an error with it. It was introduced as its own flag in 4.4.

## Best practice

Enable it where you model patches or request bodies and the difference between "absent" and "`undefined`" is real, and write `| undefined` where you accept both.
