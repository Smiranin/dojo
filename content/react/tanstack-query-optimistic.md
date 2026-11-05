---
difficulty: hard
tags: [server-state]
source: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
---

## Question

How do you implement an optimistic update with TanStack Query and roll it back when the request fails?

## Answer

In `onMutate` cancel outgoing refetches, snapshot the cache with `getQueryData`, write the optimistic value with `setQueryData`, and return the snapshot. In `onError` write back the snapshot that `onMutate` returned (it arrives as the third argument), and in `onSettled` invalidate to resync with the server.

## Explanation

`cancelQueries` prevents an in-flight refetch from overwriting the optimistic value. The simpler UI-based approach uses `variables` and `isPending` from `useMutation` to render the pending item without touching the cache.

```tsx
onMutate: async (newTodo, context) => {
  await context.client.cancelQueries({ queryKey: ['todos'] });
  const previous = context.client.getQueryData<Todo[]>(['todos']);
  context.client.setQueryData<Todo[]>(['todos'], (old = []) => [...old, newTodo]);
  return { previous };
},
onError: (_e, _v, result, context) => context.client.setQueryData(['todos'], result?.previous),
onSettled: (_d, _e, _v, _r, context) => context.client.invalidateQueries({ queryKey: ['todos'] }),
```

## Best practice

Use the UI-based variant when only one place shows the item; the cache variant when several components read it.
