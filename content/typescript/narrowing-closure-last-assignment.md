---
difficulty: medium
tags: [narrowing, modern]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#preserved-narrowing-in-closures-following-last-assignments
---

## Question

This used to fail inside the callback. Does it compile in current TypeScript, and when would it still not?

```ts
function getUrls(url: string | URL, names: string[]) {
  if (typeof url === "string") { url = new URL(url); }
  return names.map(name => { url.searchParams.set("name", name); return url.toString(); });
}
```

## Answer

It compiles since 5.4. When a `let` variable or parameter is used in a non-hoisted function, the checker finds its last assignment and keeps the narrowing from there. It does not apply if the variable is assigned anywhere in a nested function.

## Explanation

5.4 notes: "When parameters and `let` variables are used in non-hoisted functions, the type-checker will look for a last assignment point. If one is found, TypeScript can safely narrow from outside the containing function." and "narrowing analysis doesn't kick in if the variable is assigned anywhere in a nested function." Function declarations are hoisted and so excluded.

## Best practice

Prefer `const` and a new variable (`const parsed = typeof url === "string" ? new URL(url) : url`), which narrows everywhere and reads clearly.
