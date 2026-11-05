---
difficulty: hard
tags: [suspense, hooks]
source: https://react.dev/blog/2024/12/05/react-19
---

## Question

This Client Component suspends forever and logs a warning about an uncached promise. Why?

```tsx
function Comments({ postId }: { postId: string }) {
  const comments = use(fetch(`/api/posts/${postId}/comments`).then((r) => r.json()));
  return <ul>{comments.map((c: Comment) => <li key={c.id}>{c.text}</li>)}</ul>;
}
```

## Answer

A new promise is created on every render, so every render suspends on a different promise. `use` needs a promise that is stable across renders: create it in a Server Component or loader and pass it down, or take it from a cache or a Suspense-compatible library.

## Explanation

`use(promise)` suspends until it resolves; rejections go to the nearest Error Boundary; `use` cannot be called in `try/catch`. Unlike hooks, `use` can be called conditionally. `use(context)` also works. Since React 19 (2024-12-05), "Creating promises inside a Client Component or hook is not yet supported, except via a Suspense-compatible library or framework." React 19.3 adds a DEV warning when a component appears to be unblocked by calling `use()` conditionally.

```tsx
function Page({ commentsPromise }: { commentsPromise: Promise<Comment[]> }) {
  return <Suspense fallback={<p>Loading…</p>}><Comments promise={commentsPromise} /></Suspense>;
}
function Comments({ promise }: { promise: Promise<Comment[]> }) {
  const comments = use(promise);
  // ...
}
```

## Best practice

Never create the promise where you `use` it; in client apps prefer TanStack Query's Suspense mode.
