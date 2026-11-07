---
difficulty: easy
tags: [data-model]
source: https://docs.python.org/3.15/tutorial/classes.html
---

## Question

What is the difference between a class attribute and an instance attribute, and what goes wrong with a mutable class attribute?

## Answer

Instance attributes belong to one object, usually set in `__init__`; class attributes are shared by all instances. A mutable class attribute such as a list is shared too, so one instance's change shows up in all of them.

## Explanation

The tutorial says instance variables are for data unique to each instance and class variables for attributes and methods shared by all instances, and its own example is a `tricks = []` class variable that is "unexpectedly shared by all dogs"; the fix is `self.tricks = []` in `__init__`. Data attributes need no declaration; they exist once first assigned.

```python
class Dog:
    tricks = []                  # mistake: one list for every Dog
    def __init__(self, name): self.name = name
    def add(self, t): self.tricks.append(t)

a, b = Dog("a"), Dog("b")
a.add("roll")
print(b.tricks)                  # ['roll']
```

## Best practice

Create mutable state in `__init__`; keep class attributes for constants. In dataclasses use `field(default_factory=list)`.
