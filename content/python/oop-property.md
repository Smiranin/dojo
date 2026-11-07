---
difficulty: easy
tags: [data-model]
source: https://docs.python.org/3.15/library/functions.html
---

## Question

What does `@property` do, and why use it instead of getter and setter methods?

## Answer

It turns a method into an attribute: reading `obj.x` calls your getter and assigning can call a setter. You start with a plain attribute and add validation or computation later without changing any caller.

## Explanation

The `property` docs describe getter, setter and deleter methods usable as decorators, and that the `@property` decorator turns a method into a getter for a read-only attribute with the same name; give the additional functions the same name as the original property. The data model states that `@property` is implemented as a data descriptor, so instances cannot override its behaviour.

```python
class Celsius:
    def __init__(self, deg): self._deg = deg
    @property
    def kelvin(self): return self._deg + 273.15
    @property
    def deg(self): return self._deg
    @deg.setter
    def deg(self, v):
        if v < -273.15: raise ValueError("below absolute zero")
        self._deg = v
```

## Best practice

Do not write `get_x()`/`set_x()` pairs; use a plain attribute until you need logic, then `@property`, and keep properties cheap.
