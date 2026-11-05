---
difficulty: easy
tags: [hooks]
source: https://react.dev/reference/react/useId
---

## Question

What is `useId` for, and what must you not use it for?

## Answer

It generates a unique, stable ID per component instance, safe across server and client rendering, for linking things like `htmlFor` and `aria-describedby`. Do not use it for list keys or cache keys.

## Explanation

Counters or random values differ between server and client and cause hydration mismatches. `useId` is derived from the tree position. In 19.2 the default prefix changed to `_r_` so IDs are valid in `view-transition-name` and XML names, so never parse or hard-code the format.

```tsx
const id = useId();
return (<><label htmlFor={`${id}-email`}>Email</label><input id={`${id}-email`} /></>);
```

## Best practice

One `useId` per component, suffix it for several fields; keys come from data.
