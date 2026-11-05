---
difficulty: easy
tags: [typescript]
source: https://react.dev/learn/typescript
---

## Question

How do you type an `onChange` handler for an input in React with TypeScript?

## Answer

Use React's synthetic event type parameterised by the element: `React.ChangeEvent<HTMLInputElement>` for `onChange`. Inline handlers are inferred from context, and `React.SyntheticEvent` is the base type for events without a listed type.

## Explanation

`event.target.value` is typed from the generic, so the handler needs no cast. Inline handlers get their types from the JSX attribute, so annotate only handlers you extract into a named function.

```tsx
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value);
}
```

## Best practice

Let inline handlers infer types; annotate only extracted handlers.
