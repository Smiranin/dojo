---
difficulty: easy
tags: [hooks, legacy]
source: https://react.dev/reference/react/Component
---

## Question

Class components still show up in old code. Why do we write function components with hooks instead?

## Answer

Hooks let a function component hold state and effects, and let you share stateful logic with custom hooks instead of wrappers and inheritance. Classes mixed unrelated logic across lifecycle methods. The docs recommend functions; classes are only needed today for error boundaries.

## Explanation

An Effect describes "synchronize with this value", started and stopped as dependencies change, rather than "do X on mount, Y on update". Custom hooks reuse logic without adding layers to the tree. Class components are still supported, but the docs say "We recommend defining components as functions instead of classes."

## Best practice

Write function components. Keep a class only for an error boundary, or use `react-error-boundary`.
