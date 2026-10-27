---
difficulty: medium
tags: [hooks, performance]
source: https://react.dev/reference/react/useMemo
---

## Question

When does `useMemo` actually help, and when is it noise?

## Answer

It helps when the computation is expensive or when referential stability of the result matters to a memoized child or an effect dependency. Otherwise it is noise.

## Explanation

React re-runs the component body on every render; `useMemo` trades a dependency comparison for skipping the computation.

## Best practice

Measure first; reach for `useMemo` when a profile shows the computation.
