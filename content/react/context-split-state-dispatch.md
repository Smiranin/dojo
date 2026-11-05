---
difficulty: hard
tags: [state-management, performance]
source: https://react.dev/learn/scaling-up-with-reducer-and-context
---

## Question

How would you structure context for a feature with state and actions, so that components that only dispatch do not re-render on every state change?

## Answer

Put `useReducer` in a provider and expose two contexts: one for state and one for `dispatch`. `dispatch` is stable, so components that only read the dispatch context never re-render because of state. Wrap them in custom hooks like `useTasks` and `useTasksDispatch`.

## Explanation

Every consumer re-renders when its context value changes, so one context mixing often-changing state and stable functions over-renders. The provider takes `children`, so children passed in as elements are not re-rendered by the provider's own state changes.

```tsx
export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  return (
    <TasksContext value={tasks}>
      <TasksDispatchContext value={dispatch}>{children}</TasksDispatchContext>
    </TasksContext>
  );
}
```

## Best practice

Throw in the hook when the provider is missing; keep context for low-frequency data; for high-frequency client state use a store with selectors.
