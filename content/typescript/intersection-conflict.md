---
difficulty: medium
tags: [type-system]
source: https://www.typescriptlang.org/docs/handbook/2/objects.html#interface-extension-vs-intersection
---

## Question

What is the type of `a.name` here?

```ts
type A = { name: string } & { name: number };
declare const a: A;
a.name;
```

## Answer

`never`. An intersection has the properties of both sides, so `name` must be `string & number`, which has no values, and nothing can be assigned to it.

## Explanation

Handbook on interface extension versus intersection: "In the case of intersection types, properties with different types will be merged automatically." and the example shows `staffer.name; // (property) name: never`. An intersection is defined with `&`. Interface `extends` reports the conflict as an error at the declaration instead.

## Best practice

Intersect object types that add properties, not ones that redefine them. When you need to change a property type, use `Omit`/mapped types or `extends`, which flag the conflict where it is introduced.
