---
difficulty: medium
tags: [rendering, state-management]
source: https://react.dev/learn/preserving-and-resetting-state
---

## Question

How does React decide whether a component keeps its state between renders, and how do you deliberately reset it?

## Answer

State belongs to a position in the render tree. Same component type at the same position keeps state; a different type, or no longer rendered, destroys it. To reset deliberately, give the component a different `key`.

## Explanation

React matches by type and position, not by JSX text. Two conditional branches that render `<Counter />` in the same place share one state. Keys are per parent, so `<Chat key={contact.id} />` makes React discard the old instance and its DOM, giving a clean state when the contact changes.

```tsx
<Chat key={contact.id} contact={contact} />
```

## Best practice

Reset state with a `key` instead of an Effect that copies props to state. To keep state for hidden content, lift it, or use `<Activity>`.
