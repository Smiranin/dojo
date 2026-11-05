---
difficulty: medium
tags: [hooks, effects]
source: https://react.dev/reference/react/useLayoutEffect
---

## Question

What is the difference between `useEffect` and `useLayoutEffect`, and when do you need the latter?

## Answer

`useLayoutEffect` runs after React updates the DOM but before the browser paints; `useEffect` normally runs after paint. Use the layout version only when you must measure the DOM and re-render before the user sees a frame, such as positioning a tooltip.

## Explanation

Layout effects block painting, so slow work hurts performance, and state updates inside them re-render synchronously. During server rendering they do nothing.

```tsx
useLayoutEffect(() => {
  const el = ref.current;
  if (!el) return;
  setTooltipHeight(el.getBoundingClientRect().height);
}, []);
```

## Best practice

Default to `useEffect`; use `useLayoutEffect` only for measure-then-adjust.
