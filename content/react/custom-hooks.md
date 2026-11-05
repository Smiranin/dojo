---
difficulty: easy
tags: [hooks, composition]
source: https://react.dev/learn/reusing-logic-with-custom-hooks
---

## Question

What is a custom hook and what does it share between components?

## Answer

A function whose name starts with `use` and that calls other hooks. It shares stateful logic, not state: every component that calls it gets its own independent state.

## Explanation

Functions that do not call hooks do not need to be hooks. Avoid "lifecycle" hooks like `useMount`.

```tsx
function useOnlineStatus() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
```

## Best practice

Name hooks for what they do, keep them pure, and return what the caller needs.
