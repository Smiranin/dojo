---
difficulty: easy
tags: [rendering, legacy]
source: https://github.com/facebook/react/releases/tag/v19.0.0
---

## Question

In older code I see `ReactDOM.render(<App />, container)`. What replaced it and why?

## Answer

`ReactDOM.render` was removed in React 19; you use `createRoot(container).render(<App />)` from `react-dom/client`, or `hydrateRoot` for server-rendered HTML. The root API is the concurrent equivalent, so the newer features built on concurrent rendering, such as Transitions, work.

## Explanation

The React 19.0.0 release notes (5 December 2024) list: "Removed: `ReactDOM.render`, `ReactDOM.hydrate`: These have been removed in favor of the concurrent equivalents: `ReactDOM.createRoot` and `ReactDOM.hydrateRoot`", "Removed: `unmountComponentAtNode`: Removed in favor of `root.unmount()`", and `findDOMNode` replaced by DOM refs. The root also carries the error callbacks `onCaughtError`, `onUncaughtError`, `onRecoverableError`.

```tsx
import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')!).render(<App />);
```

## Best practice

Always `createRoot`/`hydrateRoot`; options go to `createRoot`, not to `render`.
