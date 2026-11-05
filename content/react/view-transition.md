---
difficulty: medium
tags: [suspense, rendering]
source: https://react.dev/blog/2026/09/09/react-19-3
---

## Question

What is `<ViewTransition>` in React 19.3 and what triggers an animation?

## Answer

It is a stable component, new in 19.3, that animates elements entering, leaving, moving or updating by using the browser View Transition API. It animates only when the update runs inside a Transition: `startTransition`, a Suspense reveal or `useDeferredValue`.

## Explanation

Types: enter, exit, update, share (a named transition removed in one place and added in another). `addTransitionType` tells the same state change apart (forward vs back). Default is a cross-fade; customise with a View Transition class and CSS. DOM only for now. Plain urgent updates do not animate.

```tsx
import { ViewTransition, startTransition } from 'react';
startTransition(() => setShowDetails(true));
{showDetails && <ViewTransition><Details /></ViewTransition>}
```

## Best practice

Wrap the update in a Transition, and wrap Suspense boundaries as `<ViewTransition update="auto" default="none">` to avoid animating cached content.
