---
difficulty: medium
tags: [build-tooling]
source: https://vite.dev/guide/env-and-mode
---

## Question

The `.env` file contains `API_KEY=…`, yet `apiKey` is `undefined` in the browser. Why, and is this the right place for a secret?

```tsx
const apiKey = import.meta.env.API_KEY;
fetch('/api/data', { headers: { Authorization: `Bearer ${apiKey}` } });
```

## Answer

Vite only exposes variables prefixed with `VITE_` to client code, so `API_KEY` is `undefined`. But renaming it to `VITE_API_KEY` would put it into the public bundle, so a real secret must never be there: call your own backend that holds the secret.

## Explanation

`import.meta.env` values are strings and statically replaced at build time. Load order: `.env`, `.env.local`, `.env.[mode]`, `.env.[mode].local`. `vite build` uses mode `production`; `--mode staging` loads `.env.staging`. Type the variables via `ImportMetaEnv` in `vite-env.d.ts`.

```ts
interface ImportMetaEnv { readonly VITE_API_URL: string }
```

## Best practice

Only non-secret config in `VITE_*`; secrets stay on the server.
