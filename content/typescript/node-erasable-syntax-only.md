---
difficulty: medium
tags: [node, modules]
source: https://nodejs.org/docs/latest-v26.x/api/typescript.html
---

## Question

What does `erasableSyntaxOnly` do, and how does it relate to Node running TypeScript?

## Answer

It makes `tsc` error on TypeScript-only constructs that have runtime behaviour: enums, runtime namespaces and parameter properties. Those are exactly what Node's type stripping cannot run, so the flag lets the type checker catch them before Node does.

## Explanation

5.8 notes: "When this flag is enabled, TypeScript will error on most TypeScript-specific constructs that have runtime behavior." and "Typically, you will want to combine this flag with the `--verbatimModuleSyntax`". The example `constructor(public x: number, public y: number) { }` is an error. Node's docs recommend TypeScript 5.8 or newer with `"erasableSyntaxOnly": true` (and `verbatimModuleSyntax`, `module: "nodenext"`, `target: "esnext"`, `rewriteRelativeImportExtensions`).

```ts
class Point {
  constructor(public x: number, public y: number) {} // error with erasableSyntaxOnly
}
class Point2 { x: number; y: number; constructor(x: number, y: number) { this.x = x; this.y = y; } }
```

## Best practice

In a project that Node runs directly, turn on `erasableSyntaxOnly` and `verbatimModuleSyntax`, and replace enums with `as const` objects.
