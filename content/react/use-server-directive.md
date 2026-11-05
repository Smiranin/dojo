---
difficulty: medium
tags: [server-components, forms]
source: https://react.dev/reference/rsc/use-server
---

## Question

What does `'use server'` do, and why is there no directive for Server Components?

## Answer

`'use server'` marks an async function as a Server Function the client can call; it does not mark Server Components, which are the default and need no directive. Treat its arguments as untrusted input and authorize every mutation.

## Explanation

Server Functions are for mutations, not data fetching, and are called in a Transition (forms do this automatically). Arguments are fully client-controlled. The React CHANGELOG records repeated hardening of Server Functions in 19.2.1 (2025-12-03), 19.2.2 and 19.2.3 (2025-12-11), 19.2.4 (2026-01-26) and 19.2.5 (2026-03-18), so keep React patched.

```tsx
'use server';
export async function rename(formData: FormData) {
  const session = await requireUser();
  await db.users.update(session.id, { name: String(formData.get('name')) });
}
```

## Best practice

Validate and authorize inside each Server Function; keep React updated.
