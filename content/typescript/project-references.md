---
difficulty: hard
tags: [compiler, declarations]
source: https://www.typescriptlang.org/docs/handbook/project-references.html
---

## Question

What are project references and what does `tsc --build` do with them?

## Answer

A way to split a codebase into several tsconfig projects that depend on each other. Each referenced project is `composite`, imports resolve to its emitted `.d.ts`, and `tsc -b` builds the projects in dependency order, skipping those that are up to date.

## Explanation

Handbook: "Referenced projects must have the new `composite` setting enabled", which requires `declaration`, and "All implementation files must be matched by an `include` pattern or listed in the `files` array." Importing from a referenced project "will instead load its _output_ declaration file (`.d.ts`)". `tsc --build` will "Find all referenced projects; Detect if they are up-to-date; Build out-of-date projects in the correct order", and "`tsc -b` effectively acts as if `noEmitOnError` is enabled for all projects." 7.0 adds an experimental `--builders` flag for the number of project reference builders run in parallel.

```json
{ "compilerOptions": { "composite": true }, "references": [{ "path": "../core" }] }
```

## Best practice

Use references to give big codebases faster incremental builds and enforce boundaries; build with `tsc -b` rather than `tsc -p`.
