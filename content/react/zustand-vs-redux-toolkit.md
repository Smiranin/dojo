---
difficulty: hard
tags: [state-management]
source: https://redux.js.org/introduction/why-rtk-is-redux-today
---

## Question

When would you choose Zustand and when Redux Toolkit for client state?

## Answer

Zustand for small to mid-size apps: minimal API, no provider, selector-based subscriptions. Redux Toolkit when a large team wants strict conventions: slices, middleware, DevTools time-travel and RTK Query in one official toolkit. Server data belongs in TanStack Query either way.

## Explanation

Redux maintainers state that anyone writing Redux today should use Redux Toolkit (`configureStore`, `createSlice` with Immer, thunk included). Zustand has far less ceremony and is the more downloaded package (88.4M vs 46.1M weekly for `@reduxjs/toolkit`, week to 2026-11-02), but gives no prescribed structure. Both use selectors to limit re-renders. The decision is about team size, need for conventions and tooling, not performance.

```tsx
// Redux Toolkit slice
const counter = createSlice({
  name: 'counter',
  initialState: { n: 0 },
  reducers: { inc: (s) => { s.n += 1; } }, // Immer makes this safe
});
```

## Best practice

Keep server data out of both and use a state library only for client state shared across distant components.
