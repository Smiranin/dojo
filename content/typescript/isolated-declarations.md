---
difficulty: hard
tags: [declarations, compiler]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#isolated-declarations
---

## Question

What does `isolatedDeclarations` enforce, and why would you turn it on?

## Answer

It requires explicit type annotations on everything a module exports, so a `.d.ts` can be produced from that file alone, without a type checker. The point is that other tools can generate declaration files in parallel and cheaply.

## Explanation

5.5 notes: "`--isolatedDeclarations` reports errors when a module can't be reliably transformed without a type-checker. More plainly, it makes TypeScript report errors if you have a file that isn't sufficiently annotated on its exports." and "`isolatedDeclarations` requires that either the `declaration` or `composite` flags are also set." For example `export function foo() { ... }` errors with `Function must have an explicit return type annotation with --isolatedDeclarations.` The reference summary: "Require sufficient annotation on exports so other tools can trivially generate declaration files."

## Best practice

Turn it on in libraries and in large multi-project repos, annotate exported return types, and let inference work inside function bodies.
