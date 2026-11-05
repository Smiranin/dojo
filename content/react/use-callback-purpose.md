---
difficulty: medium
tags: [hooks, performance]
source: https://react.dev/reference/react/useCallback
---

## Question

What does `useCallback` do and when is it worth using?

## Answer

It caches the function itself between renders, so its identity stays the same until a dependency changes; `useCallback(fn, deps)` is `useMemo(() => fn, deps)`. That matters only when the function goes to a `memo`-wrapped child or into another hook's dependencies; otherwise it is noise.

## Explanation

It does not make the function run faster; it only stabilizes identity. An updater (`setTodos((t) => [...t, x])`) avoids depending on state.

```tsx
const handleSubmit = useCallback((order: Order) => post('/buy', order), []);
```

## Best practice

Do not wrap every handler; the compiler does it automatically where it matters.
