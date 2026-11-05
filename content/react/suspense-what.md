---
difficulty: easy
tags: [suspense]
source: https://react.dev/reference/react/Suspense
---

## Question

What does `<Suspense>` do?

## Answer

It shows a fallback while something inside it is not ready, such as a lazy component or data read with `use`, and swaps in the real content when it is. It lets you declare loading states at the boundary instead of in each component.

## Explanation

Only Suspense-enabled sources activate it: `lazy`, `use(promise)`, streaming server rendering, and Suspense-aware libraries or frameworks. Data fetched in an Effect or event handler is not detected. Content that is already visible is not hidden again if the update runs in a Transition. Nested boundaries reveal progressively.

```tsx
<Suspense fallback={<Skeleton />}><Comments /></Suspense>
```

## Best practice

Place boundaries around meaningful UI chunks, not around every component.
