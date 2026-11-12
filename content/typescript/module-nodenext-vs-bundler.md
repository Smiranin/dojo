---
difficulty: hard
tags: [modules, compiler]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
---

## Question

How do you choose between `moduleResolution: nodenext` and `bundler`?

## Answer

`nodenext` models Node's real rules, so use it when the emitted code runs in Node: extensions are required in ESM imports, `package.json` `exports` are honoured with the right conditions, and the file's format decides ESM or CommonJS. `bundler` models a bundler, where extensionless relative imports are fine; use it only when a bundler consumes the code.

## Explanation

The 6.0 announcement: under the heading "Combining `--moduleResolution bundler` with `--module commonjs`", "TypeScript's `--moduleResolution bundler` setting was previously only allowed to be used with `--module esnext` or `--module preserve`", and with the deprecation of node10 resolution "this new combination is often the most suitable upgrade path for many projects". The modules reference (unversioned, older than 6.0 on this point) still says bundler "must be paired with `--module esnext` or `--module preserve`"; where they differ the 6.0 announcement wins. `nodenext` and `node16` must be paired with a matching `--module`, and in `nodenext` "directory modules and extensionless paths are only supported in `require` calls, not in `import`s". The guide: "`"moduleResolution": "bundler"` is infectious, allowing code that only works in bundlers to be produced"; for a library "you can instead use the strictest possible settings, since satisfying those tends to satisfy all others". Both the 6.0 and the 7.0 announcements default `module` to `esnext`.

## Best practice

Apps run by Node: `module: nodenext`. Apps built by a bundler: `module: esnext` or `preserve` with `bundler`. Libraries: the strictest settings the guide recommends (its template uses `module: node18`).
