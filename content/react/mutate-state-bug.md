---
difficulty: easy
tags: [state-management, rendering]
source: https://react.dev/learn/updating-objects-in-state
---

## Question

The button adds an item but nothing appears until something else re-renders. Why?

```tsx
const [todos, setTodos] = useState<string[]>([]);
function add(text: string) {
  todos.push(text);
  setTodos(todos);
}
```

## Answer

The array was mutated and the same reference was set. React compares with `Object.is`, sees no change and skips the render. Treat state as read-only and set a new array: `setTodos([...todos, text])`.

## Explanation

Immutable updates also keep memoization, `useEffect` dependencies and undo history correct. Spread is shallow, so nested objects need their own copy (or Immer).

```tsx
setTodos((prev) => [...prev, text]);
```

## Best practice

Use spread, `map`, `filter`, `toSorted`; use Immer for deep trees.
