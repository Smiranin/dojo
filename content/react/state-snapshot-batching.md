---
difficulty: medium
tags: [rendering, hooks]
source: https://react.dev/learn/queueing-a-series-of-state-updates
---

## Question

What is logged and what is the counter after one click here?

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    console.log(count);
  }
  return <button onClick={handleClick}>{count}</button>;
}
```

## Answer

It logs 0 and the counter shows 1, not 3. State is a snapshot: `count` is 0 for the whole render in which the handler was created, so all three calls queue "set to 1". To add three, pass an updater: `setCount((c) => c + 1)`.

## Explanation

Setting state does not change the variable of the running render; it requests a new render. React batches all updates in one event handler and processes them together after the handler finishes. `setCount(5)` behaves like `setCount(() => 5)`; an updater receives the result of the previous queued update. Updaters must be pure (Strict Mode calls them twice). Batching happens within one event, not across separate clicks.

```tsx
setCount((c) => c + 1); // queue: +1
setCount((c) => c + 1); // queue: +1 → total +3 after the handler
```

## Best practice

Use the updater form whenever the next state depends on the previous one, especially in timeouts, effects and handlers that run several updates.
