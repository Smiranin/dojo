---
difficulty: medium
tags: [forms, typescript]
source: https://zod.dev/v4
---

## Question

How do you add schema validation to React Hook Form and keep the form types in sync with it?

## Answer

Define a Zod schema, pass `zodResolver(schema)` as `resolver` to `useForm`, and derive the form's type with `z.infer<typeof schema>`. The schema is then the single source of truth for validation and types.

## Explanation

The `resolver` replaces built-in rules (they cannot be combined). Zod 4 imports as `import * as z from 'zod'` and needs TypeScript 5.5+ with `strict`. `@hookform/resolvers` is at v7.0.2 (2026-11-03). Zod 4 moved string formats to top level, `z.email()`, and replaced `message` with `error`.

```tsx
const schema = z.object({ email: z.email(), age: z.number().min(18) });
type FormValues = z.infer<typeof schema>;
const form = useForm<FormValues>({ resolver: zodResolver(schema) });
```

## Best practice

Share the same schema with the server and re-validate there. Mind that a number `<input>` submits a string, so use `valueAsNumber: true`.
