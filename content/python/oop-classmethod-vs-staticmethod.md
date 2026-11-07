---
difficulty: medium
tags: [data-model]
source: https://docs.python.org/3.15/library/functions.html
---

## Question

What does this print, and when would you use `@classmethod` instead of `@staticmethod`?

```python
class Pizza:
    def __init__(self, toppings):
        self.toppings = toppings

    @classmethod
    def margherita(cls):
        return cls(["mozzarella"])

    @staticmethod
    def is_vegan(toppings):
        return "ham" not in toppings

class Calzone(Pizza):
    pass

print(type(Calzone.margherita()).__name__)
print(Calzone.is_vegan(["ham"]))
```

## Answer

It prints `Calzone` and then `False`. A class method receives the class it was called on, so alternative constructors return the subclass; a static method receives no implicit first argument and is just a function in the class namespace.

## Explanation

The built-ins docs say "A class method receives the class as an implicit first argument, just like an instance method receives the instance", "A static method does not receive an implicit first argument", and point to `@classmethod` as useful for creating alternate class constructors. Both are non-data descriptors, so instances can override them. Version note: class methods could wrap other descriptors such as `property()` from 3.9; that was deprecated in 3.11 and removed in 3.13.

## Best practice

Use `@classmethod` for factories (`from_env`, `from_dict`) so subclasses work, prefer module-level functions to static methods, and never stack `@classmethod` on `@property`.

```python
import os
from dataclasses import dataclass

@dataclass
class Config:
    url: str

    @classmethod
    def from_env(cls) -> "Config":      # subclasses get their own type back
        return cls(os.environ["URL"])
```
