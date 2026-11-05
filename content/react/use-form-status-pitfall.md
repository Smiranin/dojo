---
difficulty: medium
tags: [forms, hooks]
source: https://react.dev/reference/react-dom/hooks/useFormStatus
---

## Question

The submit button never shows "Saving…". What is the bug?

```tsx
function SignupForm() {
  const { pending } = useFormStatus();
  return (
    <form action={signup}>
      <input name="email" />
      <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
    </form>
  );
}
```

## Answer

`useFormStatus` reads the status of a parent `<form>`, but here it runs in the same component that renders the form, so it finds no parent form and `pending` is always false. Move the button into its own child component.

## Explanation

It must be called from a component rendered inside the form and is imported from `react-dom`.

```tsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}
```

## Best practice

Build a reusable `SubmitButton`; or use the third value from `useActionState`.
