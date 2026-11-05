---
difficulty: hard
tags: [server-components]
source: https://react.dev/reference/rsc/use-client
---

## Question

What does `'use client'` actually mark, and what can you pass across the boundary?

## Answer

It marks a module, and everything it imports, as client code; it is a boundary in the module graph, not in the render tree. Props from server to client must be serializable, and a Server Component can still be passed in as `children` and render on the server.

## Explanation

Serializable: primitives, arrays, Map, Set, Date, plain objects, JSX, Promises and Server Functions. Not serializable: ordinary functions, class instances. Directive must be at the very top of the file. A `'use client'` module imported from another client module has no extra effect.

```tsx
'use client';
import { useState } from 'react';
export function Counter() { const [n, setN] = useState(0); return <button onClick={() => setN(n + 1)}>{n}</button>; }
```

## Best practice

Keep the boundary low in the tree; pass server content as `children`.
