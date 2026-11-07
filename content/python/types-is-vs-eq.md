---
difficulty: easy
tags: [data-model]
source: https://docs.python.org/3.15/reference/datamodel.html
---

## Question

What is the difference between `is` and `==` in Python, and when would you use `is`?

## Answer

`==` compares values; `is` compares object identity, whether two names refer to the very same object. Use `is` only for singletons, above all `is None`.

## Explanation

Every object has an identity that never changes, a type and a value; the `is` operator compares identities and `id()` returns the identity. `==` calls `__eq__`.

JS/TS comparison: MDN says JavaScript's `==` performs a type conversion ("In most cases, using loose equality is discouraged") and `===` compares without conversion; Python's `==` has no such coercion, so there is no `0 == "0"` trap, while Python `is` is about identity, like `Object.is()` on objects.

```python
a = [1, 2]
b = [1, 2]
print(a == b)      # True: same value
print(a is b)      # False: two list objects
x = None
print(x is None)   # True
```

## Best practice

Write `if x is None` / `is not None`; never compare to `None` with `==`. Do not use `is` for numbers or strings.
