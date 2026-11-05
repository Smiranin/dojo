---
difficulty: hard
tags: [hooks, effects]
source: https://react.dev/blog/2025/10/01/react-19-2
---

## Question

What problem does `useEffectEvent` solve, and what is the wrong way to use it?

## Answer

It extracts non-reactive logic out of an Effect: an Effect Event always sees the latest props and state but is not a dependency, so the Effect does not re-sync when they change. It must be called only from inside Effects, and must not be used just to dodge the dependency array.

## Explanation

A chat Effect that depends on `roomId` should not reconnect when `theme` changes just because the "connected" notification uses `theme`. It shipped stable in React 19.2 (2025-10-01). Effect Events do not have a stable identity, cannot be passed to children, and are not listed as dependencies.

```tsx
const onConnected = useEffectEvent(() => showNotification('Connected!', theme));
useEffect(() => {
  const conn = createConnection(serverUrl, roomId);
  conn.on('connected', () => onConnected());
  conn.connect();
  return () => conn.disconnect();
}, [roomId]);
```

## Best practice

Use it only for logic that is an "event" fired from an Effect; use a recent `eslint-plugin-react-hooks`.
