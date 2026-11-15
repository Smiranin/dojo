---
difficulty: easy
tags: [type-system, inference]
source: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-inference
---

## Question

Why does this fail to compile, and how do you fix it?

```ts
declare function handleRequest(url: string, method: "GET" | "POST"): void;
const req = { url: "https://example.com", method: "GET" };
handleRequest(req.url, req.method);
```

## Answer

Properties of an object literal are widened, so `req.method` is `string`, not `"GET"`, because TypeScript assumes the property may change later. Fix it with `as const` on the object or by annotating the type of `req`.

## Explanation

The handbook says "When you initialize a variable with an object, TypeScript assumes that the properties of that object might change values later." The error is `Argument of type 'string' is not assignable to parameter of type '"GET" | "POST"'.` (2345). A `const` variable keeps a literal type (`const constantString = "Hello World"` is `"Hello World"`), a `let` is widened to `string`, but object properties are widened even under `const`. `as const` "acts like `const` but for the type system".

```ts
const req = { url: "https://example.com", method: "GET" } as const;
```

## Best practice

Annotate with the target type when you have one (`const req: { url: string; method: "GET" | "POST" } = ...`), use `as const` for fixed literal data.
