---
difficulty: medium
tags: [performance]
source: https://react.dev/reference/react/memo
---

## Question

`Row` is wrapped in `memo`, yet it re-renders every time the parent does. Why?

```tsx
const Row = memo(function Row({ item, style }: { item: Item; style: React.CSSProperties }) {
  return <li style={style}>{item.name}</li>;
});
function List({ items }: { items: Item[] }) {
  return items.map((item) => <Row key={item.id} item={item} style={{ color: 'red' }} />);
}
```

## Answer

`memo` compares props shallowly with `Object.is`, and `style={{ color: 'red' }}` is a new object every render, so the props always differ. Hoist the constant or memoize it; the same applies to inline functions and arrays.

## Explanation

`memo` is only a performance hint. A memoized component still re-renders when its own state or a context it reads changes. A custom `arePropsEqual` must compare every prop, including functions, otherwise stale closures appear.

```tsx
const rowStyle = { color: 'red' } as const;
<Row key={item.id} item={item} style={rowStyle} />
```

## Best practice

Measure first; with the React Compiler enabled it adds this memoization itself.
