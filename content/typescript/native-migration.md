---
difficulty: medium
tags: [compiler]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
---

## Question

How do you migrate a large project to TypeScript 7.0 without a big bang?

## Answer

Move to 6.0 first, fix every deprecation instead of silencing it, and turn on `stableTypeOrdering` to see ordering differences. When 6.0 compiles cleanly without `ignoreDeprecations`, 7.0 should produce the same result.

## Explanation

6.0 is the bridge: deprecated options work with `"ignoreDeprecations": "6.0"`, but 7.0 does not support them. `--stableTypeOrdering` makes 6.0 order types as 7.0 does, with a warning that it "can add a substantial slowdown to type-checking (up to 25% depending on codebase)" and is "not intended to be used as a long-term feature". 7.0 makes `stableTypeOrdering` always on. The 6.0 post points to the experimental `ts5to6` tool for `baseUrl` and `rootDir` migrations. The post also lists new defaults to check: `strict`, `module: esnext`, `types: []`, `rootDir`.

## Best practice

Migrate in steps (6.0, remove `ignoreDeprecations`, then 7.0), pin `types` and `rootDir`, and run `tsc` from 6.0 and 7.0 side by side in CI during the change.
