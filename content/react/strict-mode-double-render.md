---
difficulty: easy
tags: [rendering]
source: https://react.dev/reference/react/StrictMode
---

## Question

Why does my component render twice in development, and why does my effect run twice?

## Answer

That is Strict Mode, on in development only. It renders twice to expose impure rendering and runs one extra setup-cleanup cycle for every Effect to expose missing cleanup. Production does not do it.

## Explanation

Strict Mode also double-calls updaters, reducers, `useMemo` and initializers, and re-runs ref callbacks. If the second call gives a different result, the code is impure. A `useRef` guard to stop the second effect run only hides the bug because the cleanup is still missing.

## Best practice

Make render pure and give every Effect a cleanup that stops what it started. Do not remove `<StrictMode>` to silence it.
