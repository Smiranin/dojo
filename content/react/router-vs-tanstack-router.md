---
difficulty: hard
tags: [routing]
source: https://tanstack.com/router/latest/docs/framework/react/comparison
---

## Question

React Router or TanStack Router for a new React app? What are the trade-offs?

## Answer

TanStack Router leads on type safety: fully inferred routes, typed search params with schema validation, and built-in loader caching. React Router leads on adoption and on its form/action model with progressive enhancement and an optional framework mode. For a type-heavy SPA TanStack Router is attractive; for the widest ecosystem and familiarity React Router is the safer default.

## Explanation

TanStack's own comparison table marks typesafe routes, search-param validation and SWR loader caching as missing in React Router, and `<Form>` and runtime route manipulation as missing in TanStack Router (self-described as not capturing every nuance). Downloads: react-router 73.4M weekly vs @tanstack/react-router 22.2M (week ending 2026-11-02).

## Best practice

Decide on need for typed search params and loader caching; do not mix both in one app.
