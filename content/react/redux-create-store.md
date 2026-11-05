---
difficulty: easy
tags: [state-management, legacy]
source: https://redux.js.org/introduction/why-rtk-is-redux-today
---

## Question

In an older codebase you see Redux set up with `createStore` and hand-written reducers. What is the modern way, and why?

## Answer

Redux Toolkit: `configureStore` and `createSlice`. The Redux docs call the core `createStore` approach obsolete because Toolkit adds sane defaults (thunk, DevTools, mutation checks) and removes boilerplate, with Immer for readable "mutating" reducers.

## Explanation

The maintainers say "If you are writing any Redux logic today, you should be using Redux Toolkit" and that the legacy `redux` core package "still works, but today we consider it to be obsolete". Existing apps should at least replace `createStore` with `configureStore`.

```ts
import { configureStore } from '@reduxjs/toolkit';
export const store = configureStore({ reducer: { counter: counter.reducer } });
export type RootState = ReturnType<typeof store.getState>;
```

## Best practice

Migrate incrementally; `createSlice` can coexist with legacy reducers.
