---
difficulty: medium
tags: [compiler]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
---

## Question

Since upgrading, my output lands in `dist/src/index.js` instead of `dist/index.js`. What happened?

## Answer

`rootDir` now defaults to the directory containing the tsconfig, not the common root of the input files. Set `"rootDir": "./src"` explicitly.

## Explanation

The 6.0 announcement: "In TypeScript 6.0, the default `rootDir` will always be the directory containing the `tsconfig.json` file. `rootDir` will only be inferred when using `tsc` from the command line without a `tsconfig.json` file." It names the symptom: "files being written to `./dist/src/index.js` instead of `./dist/index.js`". 7.0 keeps it: "`rootDir` now defaults to `./`, and inner source directories must be explicitly set."

```json
{ "compilerOptions": { "rootDir": "./src", "outDir": "./dist" } }
```

## Best practice

Always set `rootDir` and `outDir` together when you emit; do not rely on inference.
