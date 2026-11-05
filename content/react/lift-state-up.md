---
difficulty: easy
tags: [state-management]
source: https://react.dev/learn/sharing-state-between-components
---

## Question

Two sibling components need the same data. Where does the state live?

## Answer

In their closest common parent: you remove the state from both children, hold it in the parent, and pass it down as props with handlers to change it. This gives each piece of state a single source of truth.

## Explanation

Lifting may change the shape (a boolean per panel becomes an `activeIndex`). If the parent is too far away, consider context or composition.

## Best practice

Keep state as close as possible to where it is used; lift only when siblings need it.
