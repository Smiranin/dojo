---
difficulty: medium
tags: [server-components]
source: https://react.dev/reference/rsc/server-components
---

## Question

What is a Server Component and what can it not do?

## Answer

It renders ahead of time in a separate server or build environment and its code is never sent to the browser. It can be `async` and read data directly, but cannot use state, effects or event handlers. A framework or bundler integration is needed.

## Explanation

A Server Component can run once at build time or per request. It cannot create context but can render a provider imported from a `'use client'` module. A Client Component cannot be async; pass it a Promise and `use` it. The bundler/framework APIs do not follow semver (React 19 post).

```tsx
async function Note({ id }: { id: string }) {
  const note = await db.notes.get(id);
  return <p>{note.text}</p>;
}
```

## Best practice

Default to Server Components for data and static UI; push interactivity to small Client leaves.
