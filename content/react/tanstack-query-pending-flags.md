---
difficulty: medium
tags: [server-state]
source: https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5
---

## Question

What is the difference between `isPending`, `isLoading` and `isFetching` in TanStack Query v5?

## Answer

`isPending` means there is no data yet. `isFetching` means a request is in flight, including background refetches. `isLoading` is `isPending && isFetching`, so it is true only while the first fetch is running.

## Explanation

In v5 the old `status: 'loading'` became `'pending'` and `isLoading` changed meaning (the old `isInitialLoading`). A disabled query (`enabled: false`) is `pending` with `fetchStatus: 'idle'`, so `isPending` there stays true while nothing loads.

```tsx
if (isPending) return <Spinner />;        // no data yet
return <List data={data} dim={isFetching} />; // dim during background refresh
```

## Best practice

Branch on `isPending`/`isError` first, then show `data`; use `isFetching` for subtle refresh indicators.
