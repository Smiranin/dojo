---
difficulty: medium
tags: [compiler, modules]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
---

## Question

After upgrading to TypeScript 7 this `tsconfig` makes `tsc` report that `process` cannot be found. What changed and what do you do?

```json
{ "compilerOptions": { "strict": true, "outDir": "dist" } }
```

## Answer

`types` now defaults to `[]`, so `@types` packages are no longer included automatically (6.0 introduced it, 7.0 keeps it). List what you need, for example `"types": ["node"]`.

## Explanation

The 6.0 announcement: "In TypeScript 6.0, the default `types` value will be `[]` (an empty array)." Previously TypeScript "would also include all packages in `node_modules/@types` by default", which is where global declarations such as `process` came from. "You can also specify a `*` entry to re-enable the old enumeration behavior"; the post recommends "an explicit array to improve build performance and predictability" and says the symptom is "a lot of type errors related to missing identifiers or unresolved built-in modules". 7.0 keeps it: "`types` now defaults to `[]`, and the old behavior can be restored by setting it to `["*"]`". The reference states the same rule ("For versions below TypeScript 6.0, by default all _visible_ '@types' packages are included").

```json
{ "compilerOptions": { "types": ["node"] } }
```

## Best practice

Declare `types` explicitly per tsconfig. The 6.0 post reports that "many projects we've looked at have improved their build time anywhere from 20-50% just by setting types appropriately".
