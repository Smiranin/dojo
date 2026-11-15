---
difficulty: hard
tags: [node, modules]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-7.html#path-rewriting-for-relative-paths
---

## Question

Node needs `import "./foo.ts"`, but tsc normally rejects `.ts` extensions in imports. How do you write code that runs under Node directly and can also be compiled to JavaScript?

## Answer

Import with the real `.ts` extension, set `allowImportingTsExtensions` when you only type-check, or `rewriteRelativeImportExtensions` when you also emit, which rewrites relative `.ts` specifiers to `.js` in the output.

## Explanation

Node: "file extensions are mandatory in `import` statements and `import()` expressions". 5.7 notes: when an import path is relative, ends in a TypeScript extension and is a non-declaration file, "the compiler will rewrite the path to the corresponding JavaScript extension (`.js`, `.jsx`, `.mjs`, `.cjs`)"; `./foo` without an extension is not rewritten. The 5.0 notes: `--allowImportingTsExtensions` "allows TypeScript files to import each other with a TypeScript-specific extension like `.ts`, `.mts`, or `.tsx`. This flag is only allowed when `--noEmit` or `--emitDeclarationOnly` is enabled, since these import paths would not be resolvable at runtime in JavaScript output files." Node's docs: "You won't need this flag if you intend to distribute `*.js` files."

```ts
import { util } from "./util.ts"; // runs in Node; emitted as "./util.js" with rewriteRelativeImportExtensions
```

## Best practice

Use the recommended Node set of options (`module: nodenext`, `rewriteRelativeImportExtensions`, `erasableSyntaxOnly`, `verbatimModuleSyntax`) when the same source is both run directly and compiled for publishing.
