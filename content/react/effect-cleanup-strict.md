---
difficulty: medium
tags: [effects]
source: https://react.dev/learn/synchronizing-with-effects
---

## Question

What does the cleanup function of an Effect do, and when does it run?

## Answer

It undoes what the Effect started, such as unsubscribing or clearing a timer. React runs it before re-running the Effect with new dependencies and once more when the component unmounts. In development Strict Mode runs an extra setup-cleanup cycle to catch a missing cleanup.

## Explanation

Think in single start/stop cycles of a synchronization process, not "mount/unmount".

```tsx
useEffect(() => {
  const conn = createConnection(serverUrl, roomId);
  conn.connect();
  return () => conn.disconnect();
}, [roomId]);
```

## Best practice

Make each Effect symmetric: whatever it starts, the cleanup stops.
