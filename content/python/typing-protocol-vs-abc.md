---
difficulty: medium
tags: [typing]
source: https://peps.python.org/pep-0544/
---

## Question

What is a `typing.Protocol`, and how does it differ from an abstract base class?

## Answer

A Protocol defines an interface by structure: any class with the required methods and attributes satisfies it for the type checker, with no inheritance. An abstract base class needs explicit subclassing and cannot be instantiated until its abstract methods are overridden.

## Explanation

PEP 544 (Final, Python 3.8) specifies protocol classes that support structural subtyping (static duck typing), where PEP 484 only had nominal subtyping. A Protocol is checked statically. At runtime it can be used with `isinstance()` only if decorated with `@runtime_checkable`, which "will check only the presence of the required methods or attributes, not their type signatures or types"; runtime checkability is not inherited.

Version notes: in 3.12 `isinstance()` checks against runtime-checkable protocols use `inspect.getattr_static()`. Since 3.15, calling `isinstance()` on a protocol class that inherits from a runtime-checkable protocol without being decorated itself is deprecated and will raise `TypeError` in 3.20. An ABC "cannot be instantiated unless all of its abstract methods and properties are overridden", and `register()` makes a virtual subclass.

JS/TS comparison: TypeScript is structural in the same way ("Type compatibility in TypeScript is based on structural subtyping"), so a Protocol is the closest Python counterpart of a TypeScript interface.

```python
from typing import Protocol

class Notifier(Protocol):
    def send(self, to: str, text: str) -> None: ...

class EmailNotifier:                      # no base class
    def send(self, to: str, text: str) -> None: ...

def alert(n: Notifier) -> None:
    n.send("ops", "disk full")

alert(EmailNotifier())                    # accepted by a type checker
```

## Best practice

Use a Protocol for dependency-injection seams and test fakes, so the consumer owns the interface. Use an ABC when you want shared implementation or enforcement at instantiation. Add `@runtime_checkable` only when you really need `isinstance`.
