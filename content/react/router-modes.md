---
difficulty: medium
tags: [routing]
source: https://reactrouter.com/start/modes
---

## Question

React Router has three modes. What are they and how do you choose?

## Answer

Declarative (`<BrowserRouter>` with `<Routes>`), Data (`createBrowserRouter` plus `RouterProvider`, adding loaders, actions, pending UI) and Framework (a Vite plugin that adds type-safe route modules, code splitting and SSR/SSG). They are additive: each mode adds features at the cost of architectural control. For a client-side app that needs data loading, choose Data mode; choose Framework mode when you want SSR and its conventions.

## Explanation

React Router 8.0.0 (released 2026-06-17) removed the `react-router-dom` package: `RouterProvider` and `HydratedRouter` are imported from `react-router/dom`, everything else from `react-router`. v8 also raised the minimums to Node 22.22.0 and React 19.2.7 and made the packages ESM-only. The latest release is 8.5.1 (2026-10-27).

```tsx
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
const router = createBrowserRouter([
  { path: '/', Component: Root, children: [{ index: true, Component: Home }] },
]);
createRoot(el).render(<RouterProvider router={router} />);
```

## Best practice

Start in Data mode for SPAs; adopt Framework mode only when you want its conventions and SSR.
