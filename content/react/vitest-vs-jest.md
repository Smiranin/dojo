---
difficulty: hard
tags: [testing, build-tooling]
source: https://vitest.dev/guide/migration
---

## Question

Vitest or Jest for a new React app? What are the trade-offs?

## Answer

Vitest for Vite projects: it reuses the Vite config and transforms, is fast, ESM- and TypeScript-native and has a Jest-compatible API. Jest remains the safe choice for existing suites. Jest is still more widely used, but Vitest is far better liked and is now downloaded more.

## Explanation

In State of JS 2025 Jest is more used (74.4% vs 53.8%), but Vitest is far more liked (97% vs 65% satisfaction). Vitest 5.0 (released 2026-09-03) and 5.1 (2026-11-02) need Vite >= 6.4 and Node >= 22.12; the migration guide lists `clearMocks` defaulting to `true` and stricter `vi.mock` hoisting. The environment is `node` by default; set `jsdom` or `happy-dom` for components (per file: `// @vitest-environment jsdom`). Jest 30.5.2 is the current Jest.

```ts
// vitest.config.ts
export default defineConfig({ test: { environment: 'jsdom', setupFiles: './setup.ts' } });
```

## Best practice

Do not migrate a stable Jest suite without a reason; use Vitest for new Vite projects.
