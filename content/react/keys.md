---
difficulty: easy
tags: [rendering]
source: https://react.dev/learn/rendering-lists#why-does-react-need-keys
---

## Question

Why must list items have stable keys?

## Answer

Keys let React match elements between renders so state and DOM nodes follow the item instead of the position. A stable key comes from the data, so reordering, inserting or removing an item keeps each item's state with that item.

## Explanation

React identifies a child by its position among siblings plus its key. Without keys it matches by position, so inserting at the top makes every row take the state of its neighbour (an input's text, a checkbox, focus). With keys React moves the existing instance. Keys only need to be unique among siblings, not globally. A key that changes on every render (`Math.random()`) is worse than none: every item is destroyed and re-created each render.

```tsx
{todos.map((todo) => (
  <TodoRow key={todo.id} todo={todo} />
))}
```

## Best practice

Use a stable id from the data. Use the index only for a static list that is never reordered, filtered or inserted into. Never generate keys during render, and never use `useId` for list keys.
