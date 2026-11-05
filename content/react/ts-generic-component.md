---
difficulty: medium
tags: [typescript]
source: https://www.typescriptlang.org/docs/handbook/2/generics.html
---

## Question

How do you write a reusable list component whose item type is checked by TypeScript?

## Answer

Make the component generic: `function List<T>({ items, renderItem }: ListProps<T>)`. TypeScript infers `T` from the `items` argument, so `renderItem` receives a correctly typed item. Constrain it with `extends` when you need a field, such as `T extends { id: string }`.

## Explanation

In the TypeScript handbook a type variable captures the argument type, and calls can pass type arguments explicitly or rely on inference; a constraint written with `extends` lets the body use known fields. A plain function declaration works in `.tsx` without special syntax.

```tsx
interface ListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}
export function List<T extends { id: string }>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((i) => <li key={i.id}>{renderItem(i)}</li>)}</ul>;
}
```

## Best practice

Prefer a function declaration; avoid `any`; constrain the type parameter to what the body needs.
