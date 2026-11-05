---
difficulty: easy
tags: [server-state]
source: https://tanstack.com/query/latest/docs/framework/react/overview
---

## Question

Why use TanStack Query instead of fetching in `useEffect` and keeping the result in `useState`?

## Answer

Server data is a cache of remote state, not client state. TanStack Query handles caching, deduplication, background refetching, retries, loading and error states and race conditions, which you would otherwise rewrite and get wrong in every Effect.

## Explanation

It "handles fetching, caching, synchronizing and updating server state". `useQuery({ queryKey, queryFn })` returns `data`, `error`, `isPending`. Multiple components that use the same key share one request.

```tsx
const { data, error, isPending } = useQuery({
  queryKey: ['todos'],
  queryFn: async (): Promise<Todo[]> => {
    const res = await fetch('/api/todos');
    if (!res.ok) throw new Error('Failed');
    return res.json();
  },
});
```

## Best practice

Create one `QueryClient` in a provider; keep server data out of Zustand/Redux.
