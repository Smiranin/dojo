---
difficulty: medium
tags: [type-system, declarations]
source: https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces
---

## Question

What happens when two interfaces with the same name are declared in the same scope, and where is that useful?

## Answer

They merge into one interface with the members of both; non-function members must be unique or have the same type. It is how you augment existing types such as globals or a library's interface from your own code.

## Explanation

Handbook: "The simplest, and perhaps most common, type of declaration merging is interface merging." and "Non-function members of the interfaces should be unique. If they are not unique, they must be of the same type." Classes cannot merge with other classes or variables.

```ts
interface Box { height: number; width: number; }
interface Box { scale: number; }
const box: Box = { height: 5, width: 6, scale: 10 };
```

## Best practice

Use merging deliberately, for module or global augmentation (see the `declare module` / `declare global` forms). Do not rely on it inside your own code, where an accidental name clash silently widens a type.
