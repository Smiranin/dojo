---
difficulty: medium
tags: [server-state]
source: https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
---

## Question

What is the difference between `staleTime` and `gcTime` in TanStack Query, and what are their defaults?

## Answer

`staleTime` is how long fetched data counts as fresh; default 0, so data is stale immediately and refetches on mount, window focus and reconnect. `gcTime` is how long an unused (inactive) query stays in the cache before garbage collection; default 5 minutes.

## Explanation

Stale data is still shown instantly while a background refetch runs. `staleTime: Infinity` means only manual invalidation refetches; `'static'` never refetches, not even on invalidation. Failed queries retry 3 times with exponential backoff by default (0 on the server). In v5 `cacheTime` was renamed `gcTime`.

```tsx
useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id), staleTime: 60_000 });
```

## Best practice

Set a sensible global `staleTime` (such as 30–60 s) to avoid refetch storms; keep `gcTime` at least as long as `staleTime`.
