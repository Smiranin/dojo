---
difficulty: easy
tags: [strictness, compiler]
source: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
---

## Question

Is `"strict": true` on by default in TypeScript 6.0 and 7.0, and what did that change for existing projects?

## Answer

Yes. Since 6.0 `strict` defaults to `true`, and 7.0 keeps that. A project that relied on the old default of `false` now has to set `"strict": false` explicitly, and one that already set `"strict": true` sees no change.

## Explanation

The 6.0 announcement (2026-03-23): "`strict` is now `true` by default" and "If you were already using `"strict": true`, nothing changes for you. If you were relying on the previous default of `false`, you'll need to explicitly set `"strict": false` in your tsconfig.json." The 7.0 announcement (2026-07-08) lists "`strict` is `true` by default" among the notable default changes and says `alwaysStrict` is assumed `true` and can no longer be set to `false`. `strict` switches on a family of separate flags, each introduced in its own release: the 2.6 notes say "The `strictFunctionTypes` switch is part of the `strict` family of switches, meaning that it defaults to on in strict mode", the 4.4 notes say `useUnknownInCatchVariables` "is enabled under the `strict` family of options", and 5.6 added `--strictBuiltinIteratorReturn` as "a new `--strict`-mode flag". Because the set grows between versions, an upgrade can add errors under `strict`.

## Best practice

Leave `strict` on and do not switch it off to get an upgrade through; fix the errors it reports. Consider the extra flags that were introduced as separate options: `noUncheckedIndexedAccess` (4.1), `noImplicitOverride` (4.3) and `exactOptionalPropertyTypes` (4.4).
