---
difficulty: medium
tags: [narrowing]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#unlisted-property-narrowing-with-the-in-operator
---

## Question

Does this compile, and what does the compiler know about `packageJSON` inside the second check?

```ts
function getName(text: string) {
  const packageJSON: unknown = JSON.parse(text);
  if (packageJSON && typeof packageJSON === "object") {
    if ("name" in packageJSON && typeof packageJSON.name === "string") {
      return packageJSON.name;
    }
  }
}
```

## Answer

It compiles since TypeScript 4.9. When you test `"name" in obj` on an object type that does not list the property, the compiler narrows `obj` to its type intersected with `Record<"name", unknown>`, so reading `.name` is allowed and typed `unknown` until you check it.

## Explanation

4.9 notes: "TypeScript 4.9 makes the `in` operator a little bit more powerful when narrowing types that _don't_ list the property at all." The 4.9 notes say a safe type such as `unknown` "would cause issues in older versions of TypeScript" for this pattern. For unions the `in` check still filters members that declare or lack the property (handbook, "The `in` operator narrowing").

## Best practice

Use `in` plus `typeof` checks to parse unknown shapes in small guards; for bigger payloads write a validator function and a type predicate.
