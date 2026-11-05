---
difficulty: easy
tags: [typescript]
source: https://react.dev/learn/typescript
---

## Question

How do you type a component's props and its `children`?

## Answer

Declare an interface or type for the props and annotate the parameter: `children: React.ReactNode` accepts everything React can render. Use `React.ReactElement` only when you require a JSX element.

## Explanation

Props typed in a function signature need no `FC`. `React.CSSProperties` types style objects. `propTypes` was removed in React 19 (19.0.0 release notes, 2024-12-05: "Using `propTypes` will now be silently ignored. ... we recommend migrating to TypeScript"), so TypeScript is the way to type props.

```tsx
interface ButtonProps {
  variant?: 'primary' | 'ghost';
  onClick?: () => void;
  children: React.ReactNode;
}
export function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return <button data-variant={variant} onClick={onClick}>{children}</button>;
}
```

## Best practice

Prefer interfaces for props; give optional props defaults with ES6 default parameters.
