---
difficulty: medium
tags: [server-state]
source: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
---

## Question

The list does not update when the user changes the filter. What is wrong with this query?

```tsx
function Todos({ status }: { status: 'open' | 'done' }) {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(status),
  });
  // ...
}
```

## Answer

The `status` variable is used in `queryFn` but is missing from `queryKey`, so every status maps to the same cache entry and a change never triggers a refetch. Put every variable the query function uses into the key: `['todos', { status }]`.

## Explanation

Keys are hashed; object key order does not matter, array order does. A key change triggers a refetch (subject to `staleTime`). Keys must be JSON-serializable. Invalidation matches by prefix.

```tsx
queryKey: ['todos', { status }],
queryFn: () => fetchTodos(status),
```

## Best practice

Create key factories (`todoKeys.list(filters)`) so keys and invalidation stay consistent.
