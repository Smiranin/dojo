---
difficulty: medium
tags: [effects, hooks]
source: https://react.dev/learn/lifecycle-of-reactive-effects
---

## Question

This component freezes the tab with "Maximum update depth exceeded". What is the bug?

```tsx
function Results({ query }: { query: string }) {
  const [items, setItems] = useState<string[]>([]);
  const options = { query, limit: 10 };
  useEffect(() => {
    search(options).then(setItems);
  }, [options]);
  return <List items={items} />;
}
```

## Answer

`options` is a new object on every render, so the dependency changes every render; the Effect runs, sets state, which renders, which creates a new object, and so on. Move the object into the Effect or depend on the primitive `query`.

## Explanation

Dependencies compare with `Object.is`, so new object or function identity counts as a change. Another classic loop: `setCount(count + 1)` in an Effect with no dependency array.

```tsx
useEffect(() => {
  search({ query, limit: 10 }).then(setItems);
}, [query]);
```

## Best practice

Create objects and functions an Effect needs inside the Effect, and depend on primitives.
