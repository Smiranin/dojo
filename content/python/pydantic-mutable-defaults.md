---
difficulty: medium
tags: [pydantic]
source: https://pydantic.dev/docs/validation/latest/concepts/fields/
---

## Question

What does this print, and why is it different from a mutable default in a regular Python function?

```python
from pydantic import BaseModel

class Cart(BaseModel):
    items: list[str] = []

a = Cart()
a.items.append("apple")
print(Cart().items)
```

## Answer

It prints `[]`. When a default is not hashable, Pydantic creates a deep copy of it for each instance, so instances do not share the list, unlike a function's default argument or a plain class attribute.

## Explanation

The Fields page (Pydantic docs, latest = v2.14.3) says that "In the event that the default value is not hashable, Pydantic will create a deep copy of the default value when creating each instance of the model" (its own example is `item_counts: list[dict[str, int]] = [{}]`). `Field(default_factory=...)` is the explicit form and is needed when the default must be computed per instance, such as `uuid4().hex`.

Compare the same code elsewhere: a function parameter `def f(x=[])` and a plain class attribute both share one list, and a stdlib `@dataclass` rejects it with `ValueError` (the rule for unhashable defaults dates from Python 3.11).

```python
from pydantic import Field

class Cart(BaseModel):
    items: list[str] = Field(default_factory=list)   # explicit, same behaviour
```

## Best practice

Use `default_factory` for mutable defaults anyway: it reads the same in dataclasses and Pydantic and does not depend on the copy rule.
