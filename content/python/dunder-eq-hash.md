---
difficulty: medium
tags: [data-model]
source: https://docs.python.org/3.15/reference/datamodel.html
---

## Question

Why must `__hash__` be defined when `__eq__` is?

## Answer

Objects that compare equal must have the same hash, or dicts and sets break. If you define `__eq__` without `__hash__`, Python sets `__hash__` to `None` and the class becomes unhashable.

## Explanation

The only required property is that objects which compare equal have the same hash value; the docs advise mixing the hash values of the components that take part in the comparison by packing them into a tuple and hashing the tuple. A class that overrides `__eq__()` and does not define `__hash__()` has `__hash__()` implicitly set to `None`, so instances raise `TypeError` when hashed and are unhashable for `isinstance(obj, collections.abc.Hashable)`. If a class holds mutable state and implements `__eq__`, it should not implement `__hash__`, because a changed hash puts the object in the wrong bucket.

```python
class Point:
    def __init__(self, x, y): self.x, self.y = x, y
    def __eq__(self, other):
        return isinstance(other, Point) and (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))

print(len({Point(1, 2), Point(1, 2)}))   # 1
```

## Best practice

For value objects use `@dataclass(frozen=True)`: when `eq` and `frozen` are both true `@dataclass` generates `__hash__()`; with `eq` true and `frozen` false it sets `__hash__` to `None`. Hand-write `__hash__` only over immutable fields.
