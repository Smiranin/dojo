---
difficulty: hard
tags: [styling]
source: https://vite.dev/guide/features#css-modules
---

## Question

How do you choose between Tailwind utilities and CSS Modules for styling a React app?

## Answer

Tailwind gives fast, consistent styling with design tokens in `@theme` and no naming; the cost is long class lists and a build step that must see complete class names. CSS Modules scope plain CSS to the component by default, which is portable and easy to review, but you write and name the CSS and manage tokens yourself. Both produce static CSS, so neither needs a runtime.

## Explanation

In a CSS Module "all class names and animation names are scoped locally by default"; Vite treats `*.module.css` as modules. They can coexist: in Tailwind v4 a CSS module needs `@reference` to use theme values with `@apply`. Runtime CSS-in-JS is a third option; by npm downloads Tailwind (166.6M weekly) is far ahead of styled-components (14.6M), week ending 2026-11-02.

```tsx
import styles from './Card.module.css';
export const Card = ({ children }: { children: React.ReactNode }) => <div className={styles.card}>{children}</div>;
```

## Best practice

Pick one primary approach per app; use Tailwind for utility styling and a module for the few complex components.
