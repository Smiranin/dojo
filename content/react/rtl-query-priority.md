---
difficulty: easy
tags: [testing]
source: https://testing-library.com/docs/queries/about
---

## Question

In React Testing Library, which queries should you reach for first, and why?

## Answer

Queries that reflect how users and assistive technology find elements: `getByRole` first (with `name`), then `getByLabelText`, `getByText`; `getByTestId` only as a last resort. Tests should resemble real use so they survive refactors and also check accessibility.

## Explanation

Priority list: role, label text, placeholder, text, display value; then alt text and title; then test id. The guiding principle: "The more your tests resemble the way your software is used, the more confidence they can give you." React Testing Library 16.3.3 (released 2026-08-27) is current.

```tsx
render(<LoginForm />);
await user.type(screen.getByLabelText(/email/i), 'a@b.com');
await user.click(screen.getByRole('button', { name: /sign in/i }));
```

## Best practice

Do not test implementation details such as state or `container.querySelector`.
