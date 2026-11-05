---
difficulty: medium
tags: [error-handling]
source: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
---

## Question

What is an error boundary, what does it not catch, and how do you write one today?

## Answer

An error boundary catches errors thrown while rendering its children and shows a fallback UI instead of removing the whole tree. It does not catch errors in event handlers, server-side rendering, its own errors, or asynchronous code like timers. It still has to be a class with `getDerivedStateFromError`, so in practice you use the `react-error-boundary` package.

## Explanation

The `Component` reference lists exactly what boundaries do not catch: event handlers; server side rendering; errors thrown in the boundary itself; asynchronous code such as `setTimeout` or `requestAnimationFrame` callbacks, with the exception of errors thrown inside the function passed to `startTransition`, which boundaries do catch. It also says: "There is currently no way to write an Error Boundary as a function component", pointing to `react-error-boundary`. Event handler errors need `try/catch`.

```tsx
import { ErrorBoundary } from 'react-error-boundary';
<ErrorBoundary fallback={<p>Something went wrong</p>} onError={logToService}>
  <Dashboard />
</ErrorBoundary>
```

## Best practice

Put several boundaries around independent regions plus one at the root, and log in `onError`.
