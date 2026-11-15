---
difficulty: medium
tags: [type-level]
source: https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as
---

## Question

What type does `Getters<Person>` produce?

```ts
type Getters<Type> = {
  [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property];
};
interface Person { name: string; age: number }
type PersonGetters = Getters<Person>;
```

## Answer

`{ getName: () => string; getAge: () => number }`. The `as` clause, added in TypeScript 4.1, renames each key; here it builds a template literal from the capitalised key. Mapping a key to `never` removes it.

## Explanation

4.1 notes: "TypeScript 4.1 allows you to re-map keys in mapped types with a new `as` clause." Handbook: "You can filter out keys by producing `never` via a conditional type". Modifiers are changed with `+` or `-` prefixes (`-readonly`, `-?`); "If you don't add a prefix, then `+` is assumed."

## Best practice

Build derived API shapes (getters, event maps) from one source type, and keep the remapping small enough to read.
