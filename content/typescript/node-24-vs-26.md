---
difficulty: medium
tags: [node]
source: https://nodejs.org/docs/latest-v26.x/api/typescript.html
---

## Question

What differs between Node 24 and Node 26 when it comes to running TypeScript?

## Answer

Both strip types by default and have it stable. Node 24 still has `--experimental-transform-types` to run enums and parameter properties; Node 26 removed it, so only erasable syntax runs. Node 26 is Active LTS since 2026-10-28; Node 24 is in Maintenance.

## Explanation

Node 26 history: "v26.0.0: Removed `--experimental-transform-types` flag." "v25.2.0, v24.12.0: Type stripping is now stable." "v24.3.0, v22.18.0: Type stripping no longer emits an experimental warning." "v23.6.0, v22.18.0: Type stripping is enabled by default." The Node 24 page documents the transform flag for non-erasable syntax such as enums and parameter properties. The Node 26 page adds that the parser needs WebAssembly (`ERR_WEBASSEMBLY_NOT_SUPPORTED` otherwise). Release table (github.com/nodejs/Release): 26.x Active LTS 2026-10-28, Maintenance 2027-10-20; 24.x Maintenance from 2026-10-20, EOL 2028-04-30; "Dates are subject to change."

## Best practice

Write erasable-only TypeScript so it runs on both, and do not depend on the transform flag; enable `erasableSyntaxOnly` to enforce it.
