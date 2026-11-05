---
difficulty: easy
tags: [performance, suspense]
source: https://react.dev/reference/react/lazy
---

## Question

How do you code-split a component in React?

## Answer

Wrap the import in `lazy(() => import('./Heavy'))` and render it inside a `<Suspense>` with a fallback. The chunk is fetched the first time it renders.

## Explanation

`lazy` needs a default export and a bundler that supports dynamic `import()`. Declare `lazy` components at module level, not inside components, or state resets on each render. Rejections go to the nearest Error Boundary.

```tsx
const Editor = lazy(() => import('./Editor'));
<Suspense fallback={<Spinner />}><Editor /></Suspense>
```

## Best practice

Split by route first, then by heavy widgets; preload on hover or intent.
