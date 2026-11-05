---
difficulty: hard
tags: [build-tooling, compiler]
source: https://react.dev/learn/react-compiler/installation
---

## Question

In a Vite 8 app, turning on the React Compiler needs an extra Babel plugin even though `@vitejs/plugin-react` is installed. Why, and what does the config look like?

## Answer

`@vitejs/plugin-react` 6 dropped Babel because Vite 8 handles React Refresh with Oxc. To run the compiler you install `@rolldown/plugin-babel` and add `babel({ presets: [reactCompilerPreset()] })` after `react()`, with `reactCompilerPreset` imported from `@vitejs/plugin-react`.

## Explanation

Plugin 6.0.0 (released 2026-03-12) removed the inline `babel` option of `react()` and dropped support for Vite 7 and below. The react.dev installation guide shows the preset for plugin version 6.0.0 or later, and the plain Babel plugin form (`babel({ plugins: ['babel-plugin-react-compiler'] })`) as an alternative. In a raw Babel pipeline the compiler must run first. DevTools shows a "Memo ✨" badge on compiled components. Vite 8 itself (2026-03-12) uses Rolldown and Oxc.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
```

## Best practice

Keep the ESLint compiler rules on; opt a component out with `"use no memo"` only as a temporary escape hatch.
