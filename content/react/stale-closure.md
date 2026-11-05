---
difficulty: hard
tags: [hooks, effects]
source: https://react.dev/learn/lifecycle-of-reactive-effects
---

## Question

What is a stale closure in an effect and how do you avoid it?

## Answer

A callback captured an old render's variables. List the dependency, use a ref, or use the functional updater. With `useEffectEvent` an Effect can read the latest values without becoming a dependency.

## Explanation

Every render creates its own props, state and functions; an Effect sees the values of the render that created it. With `[]` the Effect runs once and its closure keeps the first render's `count` forever, so the interval sets `0 + 1` again and again.

```tsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000); // count is frozen at 0
  return () => clearInterval(id);
}, []);
```

Fix 1, functional updater: `setCount((c) => c + 1)` needs no `count`. Fix 2, list `count` in the dependencies so the interval is re-created. Fix 3, `useEffectEvent` for logic that must see the latest values but should not restart the Effect. Never silence the lint rule.

## Best practice

Trust `react-hooks/exhaustive-deps`. Prefer the updater form for state that depends on itself; use `useEffectEvent` (React 19.2+) for "read latest, do not re-sync".
