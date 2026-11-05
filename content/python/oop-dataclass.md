---
difficulty: easy
tags: [data-model]
source: https://docs.python.org/3.15/library/dataclasses.html
---

## Question

What does `@dataclass` give you, and what do `frozen` and `field(default_factory=...)` do?

## Answer

It generates `__init__`, `__repr__` and `__eq__` from the annotated fields. `frozen=True` makes assigning to fields raise an exception, and `default_factory` creates a fresh default such as an empty list for every instance.

## Explanation

`eq` compares the fields in order and both instances must be of the identical type. A mutable default such as `[]` raises `ValueError`; since 3.11 any unhashable default is rejected because "unhashability is used to approximate mutability". Version notes: `slots=True` and `kw_only=True` were added in 3.10; the generated `__eq__` compares fields individually since 3.13; `field(doc=)` was added in 3.14.

```python
from dataclasses import dataclass, field

@dataclass(frozen=True, slots=True, kw_only=True)
class Order:
    id: int
    items: tuple[str, ...] = ()

@dataclass
class Cart:
    items: list[str] = field(default_factory=list)
```

## Best practice

Make value objects `frozen=True, slots=True`; use `default_factory` for lists and dicts; keep validation of external input in Pydantic models, not in dataclasses.
