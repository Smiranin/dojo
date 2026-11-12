---
difficulty: medium
tags: [type-system, modern]
source: https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums
---

## Question

Do you use `enum` in new TypeScript code?

## Answer

Usually not: an `as const` object plus a derived union gives the same safety and stays plain JavaScript, whereas an enum is a TypeScript-only construct that emits runtime code. Enums are still fine and fully supported, but they do not work where only erasable syntax is allowed.

## Explanation

Handbook: "In modern TypeScript, you may not need an enum when an object with `as const` could suffice". Enums "are real objects that exist at runtime", numeric enums get a reverse mapping, string enums do not, and const enums "are completely removed during compilation", with a "Const enum pitfalls" section that ends "Do not use const enums at all." Since 5.0 every enum is a union enum. Under `--erasableSyntaxOnly` (and Node's type stripping) `enum` declarations are errors.

```ts
const Direction = { Up: "UP", Down: "DOWN" } as const;
type Direction = typeof Direction[keyof typeof Direction];
```

## Best practice

Default to `as const` objects and unions; keep an existing enum rather than rewrite it; avoid `const enum`.
