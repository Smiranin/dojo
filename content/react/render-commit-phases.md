---
difficulty: easy
tags: [rendering]
source: https://react.dev/learn/render-and-commit
---

## Question

Walk me through what happens between calling `setState` and the screen changing.

## Answer

React goes through three steps: trigger, render, commit. The state update schedules a render; React calls the components to compute the new UI; then it commits only the differences to the DOM, and the browser paints afterwards.

## Explanation

"Rendering" means React calling your component functions, not touching the DOM. Render is pure calculation and can be repeated or thrown away (Strict Mode, concurrent rendering). Commit is the only step that mutates the DOM, and React changes only the nodes that differ. Effects run after commit; `useLayoutEffect` runs before paint, `useEffect` usually after.

## Best practice

Keep render free of side effects; put side effects into event handlers or Effects. Do not optimize "re-renders" that do not change the DOM before measuring.
