---
difficulty: hard
tags: [performance, hooks]
source: https://react.dev/reference/react/useTransition
---

## Question

What do `useTransition` and `useDeferredValue` do, and how do you choose between them?

## Answer

Both mark work as non-urgent so React can keep the UI responsive and interrupt the slow render. `useTransition` wraps the state update you control; `useDeferredValue` wraps a value you receive, such as a prop. Both avoid replacing visible content with a Suspense fallback.

## Explanation

Urgent updates (typing) interrupt the in-progress transition render. A text input cannot be controlled by a transition state, so keep the input's state urgent and defer the list. `useDeferredValue` helps only if the slow child is wrapped in `memo`, because otherwise it re-renders with the new value anyway. Updates after an `await` inside a transition need another `startTransition`. Unlike a debounce there is no fixed delay and it adapts to the device.

```tsx
const [query, setQuery] = useState('');
const deferredQuery = useDeferredValue(query);
return (<>
  <input value={query} onChange={(e) => setQuery(e.target.value)} />
  <SlowList query={deferredQuery} />   {/* SlowList is wrapped in memo */}
</>);
```

## Best practice

Transition for navigation and tab switches; deferred value for filtering by a prop; use `isPending` to dim stale UI.
