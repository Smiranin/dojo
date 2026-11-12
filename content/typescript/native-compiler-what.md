---
difficulty: easy
tags: [compiler]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
---

## Question

What is TypeScript 7.0?

## Answer

The first release of the native compiler, a port of the compiler and language service to Go. It is the regular `tsc` from the `typescript` package, checks the same types and emits the same JavaScript as 6.0, but runs parsing, checking and emit in parallel, so builds are much faster.

## Explanation

The 7.0 announcement (2026-07-08): install with `npm install -D typescript` to get the new `tsc`; "Practically any TypeScript code that compiles cleanly with TypeScript 6.0 (with the `stableTypeOrdering` flag on, and without any `ignoreDeprecations` flag set) should compile identically in TypeScript 7.0." The earlier preview was the `@typescript/native-preview` package. 7.0 ships without a programmatic API ("We expect TypeScript 7.1 to ship with a new (and different) API"), so tools that use the API stay on 6.0 through `@typescript/typescript6`, which provides `tsc6`. The post's benchmark table shows for example vscode 125.7s on TypeScript 6 against 10.6s on TypeScript 7 (11.9x).

## Best practice

Use 7.0 for builds and the editor; keep a 6.0 alias only for tooling that needs the old API.
