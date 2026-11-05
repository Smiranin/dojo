---
difficulty: hard
tags: [testing, server-state]
source: https://mswjs.io/docs/quick-start
---

## Question

How do you mock API calls in component tests, and why do many teams prefer Mock Service Worker over mocking `fetch`?

## Answer

MSW intercepts requests at the network level, so your component and its data library run exactly as in production and the test only decides what the "server" answers. Mocking `fetch` or the data hook couples tests to implementation and skips real behaviour like loading and error states.

## Explanation

In MSW 3 the handlers are imported from `msw/http` (2.x imported them from `msw`), and `setupServer` from `msw/node`; MSW 3.0.0 (published 2026-09-28) is ESM-only and needs Node 22 or later. The same handlers work in tests and in the browser. In State of JS 2025 MSW had 87% satisfaction. With TanStack Query create a fresh `QueryClient` per test with `retry: false`.

```ts
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw/http';
export const handlers = [
  http.get('https://api.example.com/user', () => HttpResponse.json({ id: 'abc-123', firstName: 'John' })),
];
// vitest.setup.ts
import { setupServer } from 'msw/node';
export const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Best practice

Override handlers per test with `server.use(...)` for error cases; reset between tests.
