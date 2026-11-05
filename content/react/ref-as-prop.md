---
difficulty: easy
tags: [composition, legacy]
source: https://react.dev/blog/2024/12/05/react-19
---

## Question

How do you pass a ref to a custom component in React 19, and what happened to `forwardRef`?

## Answer

In React 19, function components receive `ref` as an ordinary prop, so you read it and pass it on. `forwardRef` is no longer needed for new code, and the React team has said it will be deprecated in a future version.

## Explanation

The 19.0.0 release notes say "`ref` as a prop: Refs can now be used as props, removing the need for `forwardRef`". Ref callbacks may also return a cleanup function. `useImperativeHandle` limits what the parent can do.

```tsx
function MyInput({ placeholder, ref }: { placeholder: string; ref?: React.Ref<HTMLInputElement> }) {
  return <input placeholder={placeholder} ref={ref} />;
}
```

## Best practice

Do not use `forwardRef` in new code. Prefer props over imperative handles.
