---
difficulty: medium
tags: [modern]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management
---

## Question

What does a `using` declaration do?

## Answer

`using x = ...` disposes the resource at the end of its scope by calling its `[Symbol.dispose]()`, even on an early `return` or a thrown error. `await using` does the same with `[Symbol.asyncDispose]`. It is the language's replacement for a hand-written `try/finally`.

## Explanation

5.2 notes: "`using` declarations do this clean-up at the very end of their containing scope or right before an 'early return' like a `return` or a `throw`n error." You need `lib` to include `esnext.disposable` (for example `"lib": ["es2022", "esnext.disposable", "dom"]`), and runtime support for `Symbol.dispose`; the page lists polyfills for `Symbol.dispose` and `Symbol.asyncDispose`, and `DisposableStack` and `SuppressedError` where used.

```ts
class TempFile implements Disposable {
  [Symbol.dispose]() { /* close and delete */ }
}
function work() { using file = new TempFile(); /* ... */ } // disposed on exit
```

## Best practice

Give resources (handles, locks, transactions) a `Disposable` wrapper and use `using`; use `DisposableStack` to group several cleanups.
