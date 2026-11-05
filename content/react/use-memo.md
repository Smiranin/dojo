---
difficulty: medium
tags: [hooks, performance]
source: https://react.dev/reference/react/useMemo
---

## Question

When does `useMemo` actually help, and when is it noise?

## Answer

It helps when the computation is expensive or when referential stability of the result matters to a memoized child or an effect dependency. Otherwise it is noise. It is a performance hint, not a semantic guarantee, and React Compiler now does most of this automatically.

## Explanation

React re-runs the component body on every render; `useMemo` trades a dependency comparison (`Object.is` per dependency) for skipping the computation. It does not make the first render faster. React may drop the cache (for example when a component suspends during its first mount), so code must stay correct without it.

```tsx
const visible = useMemo(() => filterTodos(todos, filter), [todos, filter]);
```

Measure with the Profiler: a calculation that takes about 1 ms or more per render in a realistic list is a candidate. Since React Compiler 1.0 (2025-10-07) memoization is applied automatically.

## Best practice

Measure first; reach for `useMemo` when a profile shows the computation. Write code that works without it.
