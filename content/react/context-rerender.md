---
difficulty: medium
tags: [state-management, performance]
source: https://react.dev/learn/passing-data-deeply-with-context
---

## Question

What happens to consumers when a context value changes?

## Answer

Every consumer re-renders, regardless of memoization between the provider and the consumer. The value is compared with `Object.is`, so an object created inline in the provider re-renders them on every provider render.

## Explanation

React compares the new `value` with the old using `Object.is`. If different, it re-renders every component that reads that context (`useContext` or `use`), even below components wrapped in `memo`. A provider that builds `value={{ user, setUser }}` inline creates a new object on every provider render, so all consumers re-render even if `user` did not change.

```tsx
function Provider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext value={value}>{children}</UserContext>;
}
```

## Best practice

Keep the value stable (state setter, `useMemo`, or compiler), split rarely changing and often changing data into separate contexts, and keep context for low-frequency data.
