---
difficulty: easy
tags: [legacy, modules]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
---

## Question

What's wrong with this import on TypeScript 7.0, and what replaces it?

```ts
import data from "./data.json" assert { type: "json" };
```

## Answer

Import assertions with the `assert` keyword are deprecated in 6.0, which reports an error for them, and 7.0 does not allow the keyword on imports. Use import attributes: `with { type: "json" }`.

## Explanation

The 6.0 announcement: "the `asserts` syntax is now deprecated in TypeScript 6.0, and using it will lead to an error" (`Import assertions have been replaced by import attributes. Use 'with' instead of 'asserts'.`), and "We have also extended our deprecation of import assertion syntax (i.e. `import ... assert {...}`) to `import()` calls like `import(..., { assert: {...} })`." (The post's own prose and heading say `asserts`; its `import()` example and the ECMAScript proposal use `assert`.) The 7.0 announcement: "The `asserts` keyword cannot be used on imports, and must use the `with` keyword instead (to align with developments on ECMAScript's import attribute syntax)." Import attributes were added in 5.3.

```ts
import data from "./data.json" with { type: "json" };
```

## Best practice

Use `with`, and check that your runtime supports import attributes for the module type you load.
