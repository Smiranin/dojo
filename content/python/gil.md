---
difficulty: medium
tags: [async]
---

## Question

What does the GIL protect and what does it not?

## Answer

It protects the interpreter state; it does not protect your data between bytecode boundaries.
