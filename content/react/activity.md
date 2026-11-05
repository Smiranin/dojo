---
difficulty: medium
tags: [suspense, rendering]
source: https://react.dev/blog/2025/10/01/react-19-2
---

## Question

What is `<Activity>` and when would you use it instead of conditional rendering?

## Answer

`<Activity mode="visible" | "hidden">` hides a subtree but keeps its state and DOM. When hidden, React destroys the Effects of the children and defers their updates; when visible again it restores state and re-creates Effects. Use it for tabs or back navigation, and to pre-render a likely next page.

## Explanation

It arrived stable in React 19.2 (2025-10-01). With `{isVisible && <Page />}` state is lost on hide. Hidden children still re-render at low priority, and media keeps playing unless paused in a layout-effect cleanup. Pre-rendering fetches only data read through Suspense sources.

```tsx
<Activity mode={tab === 'inbox' ? 'visible' : 'hidden'}>
  <Inbox />
</Activity>
```

## Best practice

Use for expensive-to-rebuild UI you will likely return to; clean up effects that must stop while hidden.
