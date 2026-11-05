---
difficulty: medium
tags: [hooks]
source: https://react.dev/reference/rules/rules-of-hooks
---

## Question

Why can't you call a hook inside a condition or a loop?

## Answer

React identifies each hook call by its order in the component, not by name. A condition or loop changes the order between renders, so state gets attached to the wrong hook. Call hooks at the top level, before any early return.

## Explanation

Internally React keeps a list of state "slots" per component; the nth call reads the nth slot. Rules: no hooks in conditions, loops, nested functions, `try/catch/finally`, event handlers, or after an early return; only in function components and custom hooks. `use` is the exception and may be called conditionally.

```tsx
function Profile({ id }: { id: string | null }) {
  if (!id) return null;            // ✗ hook below runs only sometimes
  const [tab, setTab] = useState('info');
  // ...
}
```

## Best practice

Use `eslint-plugin-react-hooks`; move the condition inside the hook or into a child component.
