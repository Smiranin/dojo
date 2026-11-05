---
difficulty: medium
tags: [hooks, state-management]
source: https://react.dev/reference/react/useReducer
---

## Question

When would you choose `useReducer` over `useState`?

## Answer

When state has several related fields or the next state depends on many kinds of events, so you want all transitions in one pure function. It also gives a stable `dispatch` to pass down and makes logic easy to test.

## Explanation

The reducer `(state, action) => newState` must be pure and must not mutate; `dispatch` has a stable identity. Typical for forms with many fields, wizards, and state machines. React calls the reducer twice in Strict Mode.

```tsx
type Action = { type: 'add'; text: string } | { type: 'toggle'; id: number };
function reducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add': return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'toggle': return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
  }
}
```

## Best practice

Model actions as events ("added", "toggled"), not setters; exhaustive `switch` on a discriminated union.
