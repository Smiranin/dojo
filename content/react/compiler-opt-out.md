---
difficulty: hard
tags: [compiler]
source: https://react.dev/reference/react-compiler/directives
---

## Question

A component misbehaves after enabling the Compiler. How do you diagnose it, and how do you opt a component out?

## Answer

First run the ESLint rules: a component that breaks the Rules of React is skipped by the compiler or may misbehave. Fix the violation; as a temporary escape hatch add the `"use no memo"` directive at the top of the function or file.

## Explanation

Directives: `"use memo"` opts in (needed with `compilationMode: 'annotation'`), `"use no memo"` opts out and always wins. `compilationMode` defaults to `'infer'`. Document the reason and plan to remove it. React DevTools shows a "Memo ✨" badge on compiled components.

```tsx
function Legacy() {
  'use no memo';
  // ...
}
```

## Best practice

Treat the directive as a bug marker; start incrementally with `annotation` mode on a big app.
