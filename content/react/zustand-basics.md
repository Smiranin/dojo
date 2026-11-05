---
difficulty: easy
tags: [state-management]
source: https://github.com/pmndrs/zustand/blob/main/README.md
---

## Question

What is Zustand and how does a component read from a store?

## Answer

Zustand is a small store library: `create` makes a hook-based store outside React, and components read it with a selector like `useStore((s) => s.bears)`. A component re-renders only when what its selector returns changes.

## Explanation

State and actions live together in the store; `set` merges updates. Selector results are compared with strict equality by default, so subscribing to one field avoids re-rendering on others. The store also works outside React via `getState`, `setState`, `subscribe`. Zustand 5.0.16 (2026-10-22) is the latest; v5 requires React 18 or later.

```tsx
import { create } from 'zustand';
interface BearState { bears: number; add: () => void }
const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  add: () => set((s) => ({ bears: s.bears + 1 })),
}));
const bears = useBearStore((s) => s.bears);
```

## Best practice

Always select the smallest slice; use the curried `create<T>()(...)` form in TypeScript.
