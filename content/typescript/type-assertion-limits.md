---
difficulty: medium
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions
---

## Question

Why does `"hello" as number` not compile, and what do people do to get around it?

## Answer

TypeScript only allows an assertion to a more specific or less specific version of the type, so unrelated types are rejected. The workaround is to assert through `unknown` (`as unknown as T`), which is unchecked and unsafe.

## Explanation

Handbook: "TypeScript only allows type assertions which convert to a more specific or less specific version of a type. This rule prevents "impossible" coercions". The error (2352) says "neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first." An assertion is erased at compile time, there is no runtime check.

## Best practice

Prefer narrowing, a type annotation or `satisfies` to an assertion. If you must assert, keep it next to the proof that makes it true, and treat a double assertion as a code-review flag.
