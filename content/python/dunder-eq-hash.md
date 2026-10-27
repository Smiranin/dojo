---
tags: [data-model]
---

## Question

Why must `__hash__` be defined when `__eq__` is?

## Answer

Equal objects must hash equally; defining `__eq__` alone sets `__hash__` to None.
