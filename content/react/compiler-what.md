---
difficulty: medium
tags: [compiler, performance]
source: https://react.dev/blog/2025/10/07/react-compiler-1
---

## Question

What is the React Compiler, and how does it work?

## Answer

It is a stable build-time Babel plugin (1.0 since October 2025) that automatically memoizes components and hooks. It relies on the Rules of React and skips code it cannot prove safe, and because it lowers code to an internal representation it can memoize conditionally and after early returns, which manual `useMemo` cannot.

## Explanation

Install `babel-plugin-react-compiler`; it must run first in the Babel pipeline; it works with React 17+ (best with 19). `eslint-plugin-react-hooks` includes compiler-powered rules (`recommended` preset).

```ts
// babel config
export default { plugins: ['babel-plugin-react-compiler'] }; // must run first
```

## Best practice

Enable it, keep the linter clean, pin the version, test before removing existing memoization.
