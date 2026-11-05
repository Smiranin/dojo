---
difficulty: hard
tags: [forms, hooks]
source: https://react.dev/reference/react/useOptimistic
---

## Question

How does `useOptimistic` work, and what happens when the server action fails?

## Answer

`useOptimistic(value)` returns a temporary state that shows your optimistic value while an Action is pending. When the Action ends, success or error, React falls back to the real `value`, so a failure rolls the UI back automatically.

## Explanation

The setter must be called inside an Action or Transition. The optimistic value is not kept; the real state must be updated by the Action. With a reducer, base state changes during the pending Action are re-applied. Calling it during render throws.

```tsx
const [optimisticLikes, addLike] = useOptimistic(likes, (cur, n: number) => cur + n);
function like() {
  startTransition(async () => { addLike(1); await postLike(); });
}
```

## Best practice

Show a failure message; update the true state in the Action.
