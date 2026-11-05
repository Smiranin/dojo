---
difficulty: medium
tags: [typescript, hooks]
source: https://github.com/facebook/react/releases/tag/v19.0.0
---

## Question

This code worked before upgrading to React 19 types. What is wrong with it now, and what is wrong even without the upgrade?

```tsx
const inputRef = useRef<HTMLInputElement>(null);
const timer = useRef<number>();
function focus() { inputRef.current.focus(); }
```

## Answer

In React 19 `useRef` requires an initial argument, so `useRef<number>()` no longer compiles; write `useRef<number | undefined>(undefined)`. And a DOM ref is `null` until React attaches the node, so `inputRef.current.focus()` is unsafe; use `inputRef.current?.focus()`.

## Explanation

The 19.0.0 release notes (5 December 2024) list "Require initial argument to `useRef`: The initial argument is now required to match `useState`, `createContext` etc" and "Refs are mutable by default: Ref objects returned from `useRef()` are now always mutable". The refs guide explains `ref.current` is `null` until React creates the node and is set back to `null` when it is removed.

```tsx
const inputRef = useRef<HTMLInputElement>(null);
const timer = useRef<number | undefined>(undefined);
function focus() { inputRef.current?.focus(); }
```

## Best practice

Use optional chaining or a guard; do not use `!`.
