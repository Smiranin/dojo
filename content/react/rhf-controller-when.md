---
difficulty: easy
tags: [forms]
source: https://react-hook-form.com/docs/usecontroller/controller
---

## Question

When do you need `Controller` or `useController` in React Hook Form?

## Answer

For controlled third-party components that do not expose a plain input `ref`, such as MUI, React Select or shadcn inputs. `Controller` wires their `value` and `onChange` to the form. For native inputs use `register`.

## Explanation

`render={({ field, fieldState }) => ...}`; `field` provides `onChange`, `onBlur`, `value`, `name`, `ref`. Do not also `register` the same field. Provide `defaultValues` to avoid the uncontrolled-to-controlled warning; never call `onChange(undefined)`.

```tsx
<Controller name="role" control={control} render={({ field }) => <Select {...field} options={roles} />} />
```

## Best practice

Prefer `register`; use `Controller` only where a component requires controlled props.
