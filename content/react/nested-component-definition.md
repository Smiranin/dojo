---
difficulty: medium
tags: [rendering]
source: https://react.dev/learn/preserving-and-resetting-state
---

## Question

Users complain that this input loses focus and its text after every keystroke. Where is the bug?

```tsx
function Form() {
  const [name, setName] = useState('');
  function NameField() {
    return <input value={name} onChange={(e) => setName(e.target.value)} />;
  }
  return <NameField />;
}
```

## Answer

`NameField` is defined inside `Form`, so every render creates a new component type. React sees a different type at that position, unmounts the old input and mounts a new one, losing focus and state. Define the component at module level or inline the JSX.

## Explanation

Type identity is compared with `===`. A function created per render is a new type each time, so reconciliation destroys the subtree. The same applies to components created inside `useMemo` or `lazy()` declared in render.

```tsx
function NameField({ name, onChange }: { name: string; onChange: (v: string) => void }) {
  return <input value={name} onChange={(e) => onChange(e.target.value)} />;
}
```

## Best practice

Declare components at the top level of the module and pass data via props. Same rule for `lazy()`.
