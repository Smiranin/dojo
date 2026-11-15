---
difficulty: easy
tags: [type-system, strictness]
source: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html#defaulting-to-the-unknown-type-in-catch-variables---useunknownincatchvariables
---

## Question

With `strict` on, what's the type of `e` here and why does `e.message` not compile?

```ts
try { JSON.parse(input); } catch (e) { console.log(e.message); }
```

## Answer

`e` is `unknown`, because `useUnknownInCatchVariables` (part of `strict`) changes the catch variable from `any` to `unknown`. Anything can be thrown in JavaScript, so you narrow first, for example with `e instanceof Error`.

## Explanation

The 4.4 release notes: "This flag changes the default type of `catch` clause variables from `any` to `unknown`." `strict` is `true` by default from TypeScript 6.0 on (6.0 release notes, "simple default changes"), and the 4.4 notes say the flag "is enabled under the `strict` family of options".

```ts
try { JSON.parse(input); } catch (e) {
  if (e instanceof Error) console.error(e.message);
  else throw e;
}
```

## Best practice

Narrow with `instanceof Error` and rethrow what you do not understand; do not annotate `catch (e: any)`.
