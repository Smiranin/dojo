---
difficulty: easy
tags: [data-model]
source: https://docs.python.org/3.15/reference/datamodel.html
---

## Question

What is the difference between `__str__` and `__repr__`, and which one should you always define?

## Answer

`__repr__` is the unambiguous developer representation, ideally valid Python that recreates the object; `__str__` is the readable one used by `print`. Define `__repr__` first, because `__str__` falls back to it.

## Explanation

The data model says `__repr__` computes the "official" representation, which should if possible look like a valid Python expression that could recreate the object, is typically used for debugging and must be information-rich and unambiguous; `__str__` computes the "informal" printable form with no expectation of being a valid expression, and the default `__str__` calls `__repr__`. Containers show element reprs.

```python
class User:
    def __init__(self, name): self.name = name
    def __repr__(self): return f"User(name={self.name!r})"

print([User("ann")])   # [User(name='ann')]
```

## Best practice

Give every domain class a `__repr__` (dataclasses generate one) and keep secrets such as tokens out of it, because reprs end up in logs and tracebacks.
