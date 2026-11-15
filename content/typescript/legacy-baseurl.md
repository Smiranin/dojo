---
difficulty: medium
tags: [legacy, modules]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
---

## Question

This config used to resolve `@app/foo` to `src/app/foo`. What breaks on 6.0 and 7.0, and what's the fix?

```json
{ "compilerOptions": { "baseUrl": "./src", "paths": { "@app/*": ["app/*"] } } }
```

## Answer

`baseUrl` is deprecated in 6.0 and not supported in 7.0, and it is no longer a lookup root. Put the prefix into each `paths` entry: `"@app/*": ["./src/app/*"]`; paths are then relative to the tsconfig.

## Explanation

6.0 announcement: "In TypeScript 6.0, `baseUrl` is deprecated and will no longer be considered a look-up root for module resolution. Developers who used `baseUrl` as a prefix for path-mapping entries can simply remove `baseUrl` and add the prefix to their `paths` entries" (`"@app/*": ["./src/app/*"]`); "Developers who actually did use `baseUrl` as a look-up root can also add an explicit path mapping to preserve the old behavior" with `"*": ["./src/*"]`, though "this is extremely rare". 7.0 announcement: "`baseUrl` is no longer supported, and `paths` can be updated to be relative to the project root instead of `baseUrl`." Node's docs: Node "ignores `tsconfig.json` files", and tsconfig `"paths"` "won't be transformed and therefore produce an error", so aliases need runtime support too.

## Best practice

Avoid path aliases unless the runtime resolves them; prefer relative imports or `package.json` subpath imports. The 6.0 announcement adds support for subpath imports that start with `#/` ("supported in newer Node.js 20 releases").
