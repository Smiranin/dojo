---
difficulty: hard
tags: [type-level, modern]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
---

## Question

A type-level string splitter worked on TypeScript 6.0. What changes for emoji input on 7.0?

```ts
type HeadTail<S extends string> = S extends `${infer H}${infer T}` ? [H, T] : never;
type R = HeadTail<"😀abc">;
```

## Answer

In 7.0 `R` is `["😀", "abc"]`; template literal inference now consumes a full Unicode code point instead of a single UTF-16 code unit. On 6.0 and before it was `["\ud83d", "\ude00abc"]`.

## Explanation

The 7.0 announcement: "TypeScript 7.0 now treats Unicode code points more naturally when inferring from template literal types." and calls this "a breaking change for type-level string manipulation that intentionally modeled UTF-16 code units". typescript-go's CHANGES.md says the same ("Corsa consumes a full Unicode code point rather than a single UTF-16 code unit").

## Best practice

Do not depend on code-unit splitting in type-level helpers; if you need it, test with non-BMP characters and pin your expectations in type tests.
