---
difficulty: medium
tags: [styling, build-tooling]
source: https://tailwindcss.com/blog/tailwindcss-v4
---

## Question

How is Tailwind CSS v4 set up in a Vite React app, and what changed from v3?

## Answer

Install `tailwindcss` and `@tailwindcss/vite`, add the plugin to `vite.config.ts`, and put `@import "tailwindcss";` in your CSS. v4 is CSS-first: configuration lives in `@theme` in CSS instead of `tailwind.config.js`, and it detects your source files automatically.

## Explanation

Tailwind v4.0 was released 22 January 2025 (release v4.0.0 published 2025-01-22). Theme tokens become CSS variables and there are no `@tailwind` directives. The upgrade guide: v4 targets Safari 16.4, Chrome 111 and Firefox 128 or newer (older browsers stay on 3.4); `shadow-sm` became `shadow-xs`; `bg-opacity-*` is removed in favour of `bg-black/50`; `@apply` inside CSS modules needs `@reference`. Use `@source` for extra paths.

```ts
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()] });
```

```css
@import "tailwindcss";
@theme { --color-brand: oklch(0.7 0.15 250); }
```

## Best practice

Run `npx @tailwindcss/upgrade` for migration; keep tokens in `@theme`.
