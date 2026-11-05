---
difficulty: medium
tags: [state-management, hooks]
source: https://github.com/pmndrs/zustand/blob/main/docs/reference/migrations/migrating-to-v5.md
---

## Question

After upgrading to Zustand v5 this component crashes with "Maximum update depth exceeded". What is wrong?

```tsx
const [search, setSearch] = useStore((s) => [s.searchValue, s.setSearchValue]);
```

## Answer

The selector returns a new array on every call, so its result is never equal to the previous one and React re-renders forever. In v5 a selector must return a stable reference: select primitives separately, or wrap the selector in `useShallow`.

## Explanation

The v5 migration guide: "There is a behavioral change in v5 to match React default behavior. If a selector returns a new reference, it may cause infinite loops." In v5 `create` no longer accepts a custom equality function; `useShallow` is the recommended replacement (`createWithEqualityFn` from `zustand/traditional` restores v4 behaviour). A fallback like `?? (() => {})` inside a selector is also a new reference each call; use a module-level constant.

```tsx
import { useShallow } from 'zustand/shallow';
const [search, setSearch] = useStore(useShallow((s) => [s.searchValue, s.setSearchValue]));
```

## Best practice

Prefer one selector per primitive; use `useShallow` when you need several fields at once.
