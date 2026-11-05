---
difficulty: medium
tags: [forms, performance]
source: https://react-hook-form.com/get-started
---

## Question

Why is React Hook Form considered fast, and what does `register` give an input?

## Answer

It embraces uncontrolled inputs: `register('email')` returns `ref`, `name`, `onChange` and `onBlur` props that attach to the real input, so values live in the DOM and the form does not re-render on every keystroke. State such as errors is tracked through a subscription model, only for what you read.

## Explanation

`useForm` returns `register`, `handleSubmit`, `formState`. `handleSubmit(onSubmit)` validates first. Validation `mode` defaults to `onSubmit`, re-validation to `onChange`. `formState` only tracks properties read during render. A custom component must pass its `ref` prop through to the real input.

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({ defaultValues: { email: '' } });
<form onSubmit={handleSubmit(save)}><input {...register('email', { required: true })} /></form>
```

## Best practice

Always give `defaultValues`; use `useWatch` in children to avoid re-rendering the whole form.
