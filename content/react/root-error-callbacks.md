---
difficulty: hard
tags: [error-handling]
source: https://react.dev/blog/2024/12/05/react-19
---

## Question

In React 19, how do you report errors globally, and what changed about how errors are logged?

## Answer

`createRoot` and `hydrateRoot` take `onCaughtError` (errors an Error Boundary caught), `onUncaughtError` (errors no boundary caught) and `onRecoverableError` (errors React recovered from, like hydration mismatches). React 19 logs each error once instead of re-throwing it.

## Explanation

Uncaught errors go to `window.reportError` and caught ones to `console.error` by default. The options are set on the root, not on `render`.

```tsx
createRoot(el, {
  onCaughtError: (error, info) => report(error, info.componentStack),
  onUncaughtError: (error, info) => report(error, info.componentStack),
  onRecoverableError: (error) => report(error),
}).render(<App />);
```

## Best practice

Wire all three to your monitoring tool once, at the root.
