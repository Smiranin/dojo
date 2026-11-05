---
difficulty: easy
tags: [effects]
source: https://react.dev/learn/synchronizing-with-effects
---

## Question

What is the difference between no dependency array, an empty one and a filled one in `useEffect`?

## Answer

No array: the Effect runs after every render. Empty `[]`: after the first render only (setup on mount, cleanup on unmount). `[a, b]`: after the first render and whenever `a` or `b` changes, compared with `Object.is`.

## Explanation

You do not choose the dependencies; they are every reactive value (props, state, anything declared in the component) the Effect reads. The linter checks this. Refs and state setters are stable and may be omitted.

## Best practice

Do not suppress the exhaustive-deps rule; restructure the code instead.
