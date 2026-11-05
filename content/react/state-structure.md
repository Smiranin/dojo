---
difficulty: medium
tags: [state-management]
source: https://react.dev/learn/choosing-the-state-structure
---

## Question

What principles do you follow when designing the shape of state?

## Answer

Group related state, avoid contradictions (use one `status` instead of `isSending` plus `isSent`), avoid redundant and duplicated state (store ids, derive the rest), and avoid deep nesting by normalizing. Do not copy props into state.

## Explanation

The goal is state that is hard to put into an impossible combination. Store `selectedId`, not a copy of the selected object, so updates to the list are not out of sync.

```tsx
type Status = 'typing' | 'sending' | 'sent';
const [status, setStatus] = useState<Status>('typing');
```

## Best practice

Model status as a union; derive everything else during render.
