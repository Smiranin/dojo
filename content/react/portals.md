---
difficulty: medium
tags: [composition, rendering]
source: https://react.dev/reference/react-dom/createPortal
---

## Question

What is a portal and why do events still bubble to the React parent?

## Answer

`createPortal(children, domNode)` renders children into a different DOM node, for modals, tooltips and dropdowns that must escape `overflow: hidden`. Events and context follow the React tree, not the DOM tree, so the portal acts like a normal child.

## Explanation

Only DOM placement changes. Manage focus and keyboard behavior for accessibility.

```tsx
import { createPortal } from 'react-dom';
return createPortal(<div role="dialog">{children}</div>, document.body);
```

## Best practice

Prefer the native `<dialog>` or an accessible library; always handle focus and Escape.
