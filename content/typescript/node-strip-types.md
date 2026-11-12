---
difficulty: medium
tags: [node]
source: https://nodejs.org/docs/latest-v26.x/api/typescript.html
---

## Question

On Node 26, can I run `node app.ts` directly, and what can't it run?

## Answer

Yes. Type stripping is on by default and stable: Node replaces the erasable TypeScript syntax with whitespace and runs the file, with no type checking. Syntax that needs generated JavaScript (enums, runtime namespaces, parameter properties, import aliases) is an error.

## Explanation

Node 26 docs: "By default Node.js will execute TypeScript files that contains only erasable TypeScript syntax. Node.js will replace TypeScript syntax with whitespace, and no type checking is performed. To disable this feature, use the flag `--no-strip-types`." History: enabled by default in v23.6.0 and v22.18.0, "stable" in v25.2.0 and v24.12.0. "Since Node.js is only removing inline types, any TypeScript features that involve _replacing_ TypeScript syntax with new JavaScript syntax will error." A namespace exporting a value gives `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. Other rules: file extensions are mandatory in imports, `tsconfig.json` is ignored, and Node refuses `.ts` files under `node_modules`. `.tsx` is not supported.

## Best practice

Run `tsc --noEmit` for type checking, and use Node for execution; keep the code to erasable syntax.
