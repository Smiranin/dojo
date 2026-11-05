---
difficulty: easy
tags: [build-tooling]
source: https://vite.dev/guide/
---

## Question

What does Vite do in dev and in production, and does it type-check?

## Answer

In development it serves your source over native ES modules with fast hot updates; for production it bundles with Rolldown (Vite 8) into optimized static assets. It does not type-check: it only strips types, so run `tsc --noEmit` in CI or a watch process.

## Explanation

Vite 8 (2026-03-12) uses Rolldown and Oxc instead of esbuild and Rollup; it needs Node 20.19+ or 22.12+. Set `isolatedModules: true` in `tsconfig.json`.

```json
{ "scripts": { "dev": "vite", "build": "tsc --noEmit && vite build" } }
```

## Best practice

Type-check as a separate step; use the `@vitejs/plugin-react` plugin for React Refresh.
