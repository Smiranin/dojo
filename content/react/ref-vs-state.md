---
difficulty: easy
tags: [hooks]
source: https://react.dev/reference/react/useRef
---

## Question

When do you use `useRef` instead of `useState`?

## Answer

Use a ref for a value that must survive renders but does not affect the output, like a DOM node, a timer id or a previous value. Changing `ref.current` does not trigger a render; changing state does.

## Explanation

A ref is a mutable box `{ current }` that React preserves. Do not read or write `ref.current` during render (except lazy initialization), because render must be pure; do it in handlers and Effects. If the value is displayed, it belongs in state.

```tsx
const timer = useRef<number | undefined>(undefined);
const start = () => { timer.current = window.setTimeout(save, 1000); };
```

## Best practice

State for what you show, refs for what you only remember or point at.
