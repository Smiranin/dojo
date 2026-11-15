---
difficulty: medium
tags: [modules, strictness]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#--verbatimmodulesyntax
---

## Question

What does `verbatimModuleSyntax` do, and why do you want it?

## Answer

Imports and exports without a `type` modifier are kept in the output exactly as written, and anything marked `type` is dropped entirely. The compiler no longer guesses which imports are only types, so what you write is what runs, and a missing `type` on a type import becomes a compile error.

## Explanation

5.0 notes: "any imports or exports without a `type` modifier are left around. Anything that uses the `type` modifier is dropped entirely." Example: `import { b, type c, type d } from "bcd";` is rewritten to `import { b } from "bcd";`. Node's docs say the `type` keyword is necessary for stripping and that `verbatimModuleSyntax` "can be used to match this behavior".

## Best practice

Turn it on and write `import type` / `import { type X }`, particularly for code run by Node's type stripping or by single-file transpilers.
