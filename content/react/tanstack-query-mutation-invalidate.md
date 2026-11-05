---
difficulty: medium
tags: [server-state]
source: https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation
---

## Question

You fetch the list with TanStack Query. After a POST succeeds, how do you make the list show the new item?

## Answer

Use `useMutation` and call `queryClient.invalidateQueries({ queryKey: ['todos'] })` in `onSuccess` (or `onSettled`). Invalidation marks matching queries stale and refetches the ones on screen.

## Explanation

Invalidation matches by key prefix; `exact: true` and `predicate` narrow it. Return the invalidation promise so the mutation stays pending until the refetch is done. Mutations default to no retry, and `mutate` callbacks only run if the component is still mounted.

```tsx
const qc = useQueryClient();
const add = useMutation({
  mutationFn: (todo: NewTodo) => postTodo(todo),
  onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
});
```

## Best practice

Prefer targeted invalidation over manually editing caches; update the cache directly only for optimistic UI.
