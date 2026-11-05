---
difficulty: hard
tags: [compiler, performance, hooks]
source: https://react.dev/blog/2025/10/07/react-compiler-1
---

## Question

With the Compiler enabled, do you still write `useMemo` and `useCallback`?

## Answer

Rarely: the compiler memoizes by default, so manual `useMemo`/`useCallback` stays only as an escape hatch for precise control, such as a memoized value used as an Effect dependency. In existing code, leave the current memoization in place.

## Explanation

Removing memoization can change compilation output and how often an Effect fires. The post advises leaving existing memoization or testing carefully, and relying on the compiler for new code.

```tsx
// fine with the compiler: no manual memo needed
const visible = items.filter((i) => i.name.includes(query));
```

## Best practice

Write plain code first; add manual memoization only where a profile or Effect dependency demands.
