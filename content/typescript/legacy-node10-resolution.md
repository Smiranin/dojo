---
difficulty: medium
tags: [legacy, modules]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
---

## Question

A project's tsconfig still says `"moduleResolution": "node"`. What happens on TypeScript 7.0 and what do you replace it with?

## Answer

`node` (also `node10`) was deprecated in 6.0 and is not supported in 7.0; it encodes the Node.js 10 resolution algorithm. Use `nodenext` for code running in Node or `bundler` for code a bundler or Bun handles.

## Explanation

6.0 announcement: "`--moduleResolution node` encoded a specific version of Node.js's module resolution algorithm that most-accurately reflected the behavior of Node.js 10", "In TypeScript 6.0, `--moduleResolution node` (specifically, `--moduleResolution node10`) is deprecated. Users who were using `--moduleResolution node` should usually migrate to `--moduleResolution nodenext` if they plan on targeting Node.js directly, or `--moduleResolution bundler` if they plan on using a bundler or Bun." Deprecated options work only with `"ignoreDeprecations": "6.0"`, and "TypeScript 7.0 will not support any of these deprecated options". The 7.0 announcement: "`moduleResolution: node/node10` are no longer supported, with `nodenext` and `bundler` being recommended instead." and "`moduleResolution: classic` is no longer supported".

## Best practice

Migrate on 6.0 first with `ignoreDeprecations` as a temporary switch, then switch resolution and `module` together.
