---
difficulty: medium
tags: [effects, state-management]
source: https://react.dev/learn/you-might-not-need-an-effect
---

## Question

What is wrong with this component, and how would you fix it?

```tsx
function Cart({ items }: { items: Item[] }) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(items.reduce((sum, i) => sum + i.price, 0));
  }, [items]);
  return <p>{total}</p>;
}
```

## Answer

`total` is derived data stored in state and synced by an Effect. That causes an extra render with a stale first value. Compute it during render: `const total = items.reduce(...)`, with `useMemo` only if it is measurably expensive.

## Explanation

React renders with the old `total`, runs the Effect, sets state and renders again. If you can calculate something from props or state, do not store it in state.

```tsx
const total = items.reduce((sum, i) => sum + i.price, 0);
```

## Best practice

Store the minimal state; derive the rest in render. To reset state when a prop changes use `key`, not an Effect.
