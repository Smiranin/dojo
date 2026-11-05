---
difficulty: hard
tags: [routing, forms]
source: https://reactrouter.com/start/data/actions
---

## Question

What do route `loader` and `action` do in React Router, and what happens after an action runs?

## Answer

A `loader` fetches data before the route renders and is read with `useLoaderData`. An `action` handles non-GET submissions from `<Form>` and receives the `Request`. After an action finishes, React Router automatically revalidates all loaders on the page so the UI shows fresh data.

## Explanation

Loaders run before the component renders, in parallel for nested routes, which avoids render-then-fetch waterfalls. `fetcher.Form` and `useFetcher` submit without navigating; `useNavigation` exposes `idle`/`loading`/`submitting` for pending UI. These need Data or Framework mode.

```tsx
{
  path: 'projects/:id',
  loader: async ({ params }) => fetchProject(params.id!),
  action: async ({ request }) => {
    const form = await request.formData();
    return updateProject(String(form.get('title')));
  },
  Component: Project,
}
```

## Best practice

Throw `data(…, { status: 404 })`/redirect from loaders for expected failures; use `useFetcher` for inline mutations.
