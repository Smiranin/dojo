---
difficulty: hard
tags: [performance, composition]
source: https://react.dev/reference/react/memo
---

## Question

A wrapper component holds fast-changing state like the mouse position and re-renders everything inside it. How can you avoid that without `memo`?

## Answer

Let the wrapper accept JSX as `children`, or move the state down into a smaller component. The `children` elements are created by the parent, which did not re-render, so when the wrapper updates its own state React knows they don't need to re-render.

## Explanation

They are the same element objects as before, so React skips them. The memo docs list this first among the principles that make memoization unnecessary, together with keeping state local (do not lift it higher than needed), keeping rendering pure, and avoiding Effects that update state.

```tsx
function MovingDot({ children }: { children: React.ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div onPointerMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      <Dot at={pos} />
      {children}
    </div>
  );
}
```

## Best practice

Colocate state, compose with `children`, and only then add `memo`/`useMemo` where the Profiler shows a problem.
