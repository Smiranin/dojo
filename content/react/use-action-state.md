---
difficulty: medium
tags: [forms, hooks]
source: https://react.dev/reference/react/useActionState
---

## Question

What does `useActionState` give you, and what is its callback's signature?

## Answer

`const [state, formAction, isPending] = useActionState(action, initialState)` returns the last result of the action, a function to pass to `<form action>`, and a pending flag. The action receives `(previousState, formData)`, and may be async.

## Explanation

Multiple calls queue and run in order. Return error info for expected failures; throw for unexpected ones to reach the Error Boundary. It replaces `ReactDOM.useFormState`, renamed and deprecated in the 19 release (2024-12-05). If you call the returned action yourself instead of passing it to `<form action>`, call it inside `startTransition`.

```tsx
const [state, submit, pending] = useActionState(
  async (prev: { error?: string }, formData: FormData) => {
    const err = await save(formData);
    return err ? { error: err } : {};
  },
  {},
);
```

## Best practice

Validate on the server too; disable the button with `pending`.
