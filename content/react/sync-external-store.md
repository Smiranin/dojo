---
difficulty: hard
tags: [hooks, state-management]
source: https://react.dev/reference/react/useSyncExternalStore
---

## Question

What is `useSyncExternalStore` and why do state libraries use it instead of an Effect plus `useState`?

## Answer

It subscribes a component to a store that lives outside React and returns an immutable snapshot. React re-reads the snapshot when the store calls back, and if the store changes during a non-blocking Transition it restarts as a blocking update so every component on screen reflects the same version of the store. External-state libraries use it to integrate safely.

## Explanation

Signature `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)`. `getSnapshot` must return the same value while the store is unchanged (compared with `Object.is`); a new object per call loops and raises "The result of `getSnapshot` should be cached". `getServerSnapshot` is required for server rendering and hydration, and must match on client and server. Declare `subscribe` outside the component or React re-subscribes every render. The docs say to prefer `useState`/`useReducer` unless you integrate non-React state.

```tsx
function subscribe(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => { window.removeEventListener('online', cb); window.removeEventListener('offline', cb); };
}
const useOnline = () => useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
```

## Best practice

Do not suspend on a store value (a mutation would trigger the nearest Suspense fallback); cache the last snapshot for mutable stores.
