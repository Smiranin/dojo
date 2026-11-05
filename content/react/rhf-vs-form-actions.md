---
difficulty: hard
tags: [forms]
source: https://react.dev/blog/2024/12/05/react-19
---

## Question

With React 19 form Actions, do you still need React Hook Form?

## Answer

For simple forms, no: `<form action>` with `useActionState` and `useFormStatus` covers submission, pending and errors with less code. React Hook Form still pays off for complex client-side forms: field-level validation, dynamic arrays, dependent fields and fine-grained re-rendering. They can be combined by calling the action from `handleSubmit`.

## Explanation

Actions give submission lifecycle (pending, errors, reset) but no field-level validation, dirty/touched tracking or schema integration. RHF supplies those. React Hook Form's `<Form action>` component exists for server submissions. Judge by form complexity, not by fashion.

```tsx
<form onSubmit={handleSubmit((values) => startTransition(() => save(values)))}>
  {/* fields */}
</form>
```

## Best practice

Start with native form Actions; add RHF when validation UX demands it.
