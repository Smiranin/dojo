---
difficulty: medium
tags: [state-management, performance]
---

## Question

What happens to consumers when a context value changes?

## Answer

Every consumer re-renders, regardless of memoization between the provider and the consumer.
