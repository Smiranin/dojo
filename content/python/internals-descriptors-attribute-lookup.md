---
difficulty: hard
tags: [internals, data-model]
source: https://docs.python.org/3.15/howto/descriptor.html
---

## Question

How do descriptors work, and why does a `property` win over the instance dictionary while a method does not?

## Answer

A descriptor is a class attribute with `__get__`, `__set__` or `__delete__`; attribute lookup invokes these hooks. Data descriptors (those with `__set__` or `__delete__`, such as `property`) override the instance `__dict__`, while non-data descriptors such as plain functions can be overridden by an instance attribute.

## Explanation

Instance lookup scans data descriptors first, then instance variables, then non-data descriptors, then class variables, and lastly `__getattr__()`. Functions include `__get__()` for binding, so they are non-data descriptors that return bound methods during dotted lookup from an instance. When a class is created, `type.__new__()` scans the class variables and calls `__set_name__()` on descriptors that define it; if a descriptor is assigned after class creation, `__set_name__` must be called manually (`__set_name__` Added in version 3.6).

```python
class Positive:
    def __set_name__(self, owner, name): self.name = "_" + name
    def __get__(self, obj, owner=None):
        return self if obj is None else getattr(obj, self.name)
    def __set__(self, obj, value):
        if value <= 0: raise ValueError("must be positive")
        setattr(obj, self.name, value)

class Item:
    price = Positive()
    def __init__(self, price): self.price = price   # goes through __set__

Item(5).price = -1    # ValueError
```

## Best practice

Use `property` for one attribute and a descriptor class when the same rule repeats across attributes; do not write descriptors for one-off logic.
