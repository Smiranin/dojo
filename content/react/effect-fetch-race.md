---
difficulty: hard
tags: [effects, server-state]
source: https://react.dev/learn/you-might-not-need-an-effect
---

## Question

This component shows the wrong user's data when the user clicks quickly through a list. Why, and how do you fix it?

```tsx
function Profile({ id }: { id: string }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetch(`/api/users/${id}`).then((r) => r.json()).then(setUser);
  }, [id]);
  return <p>{user?.name}</p>;
}
```

## Answer

Responses can return out of order, so an old request can overwrite the newer one: a race condition. Ignore stale results in the cleanup with an `ignore` flag or abort the request with `AbortController`. Better still, use a data-fetching library that handles this.

## Explanation

Each `id` change starts a new request; the cleanup of the previous Effect can mark its result as stale.

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch((e) => { if (e.name !== 'AbortError') throw e; });
  return () => controller.abort();
}, [id]);
```

Also missing here: loading and error states, caching, and deduplication, which TanStack Query provides.

## Best practice

Fetch with TanStack Query (or a framework loader) rather than raw Effects.
