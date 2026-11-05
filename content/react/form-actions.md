---
difficulty: medium
tags: [forms]
source: https://react.dev/blog/2024/12/05/react-19
---

## Question

What does passing a function to a form's `action` prop do in React 19?

## Answer

React calls the function with the `FormData` when the form submits, inside a Transition, so the pending state, thrown errors and uncontrolled-field reset are handled for you. You no longer need `onSubmit`, `preventDefault` or manual loading state.

## Explanation

The function may be async. After it succeeds, uncontrolled fields are reset (`requestFormReset` resets manually). The HTTP method is always POST when a function is passed. A Server Function passed to `action` enables progressive enhancement. `formAction` on a button overrides.

```tsx
async function save(formData: FormData) {
  await updateName(String(formData.get('name')));
}
<form action={save}><input name="name" /><button>Save</button></form>
```

## Best practice

Read values from `FormData`; wrap the form in an Error Boundary.
