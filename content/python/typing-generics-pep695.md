---
difficulty: medium
tags: [typing]
source: https://peps.python.org/pep-0695/
---

## Question

How do you write a generic function or class in current Python, and what changed in 3.12?

## Answer

Put the type parameters in square brackets after the name: `def first[T](items: list[T]) -> T` or `class Box[T]`. Python 3.12 added this syntax (PEP 695) together with the `type` statement for aliases, so you no longer create `TypeVar` objects by hand.

## Explanation

PEP 695 (Final, Python 3.12) specifies an improved syntax for type parameters in generic classes, functions and type aliases, plus a new statement for declaring type aliases. The `typing` docs (Python 3.15.2) say "The type statement is new in Python 3.12" and "Syntactic support for generics and type aliases is new in version 3.12". Type parameter lists were added in 3.12, and default values for type parameters came in 3.13 (PEP 696). Generic classes implicitly inherit from `typing.Generic`. Aliases created with `type` are `TypeAliasType` objects whose value is lazily evaluated. The older `TypeVar("T")` style still works, and `TypeAlias` is deprecated since 3.12 in favour of the `type` statement.

JS/TS comparison: it reads like TypeScript's `function identity<Type>(arg: Type): Type`, with `[]` instead of `<>`. TypeScript erases its type syntax at compile time, while Python keeps type parameters as runtime objects.

```python
def first[T](items: list[T]) -> T:
    return items[0]

class Box[T]:
    def __init__(self, value: T) -> None:
        self.value = value

type UserId = int                      # 3.12+: a type alias statement
type Pair[K, V] = tuple[K, V]
```

## Best practice

Use the bracket syntax when your minimum Python is 3.12 (the 3.15 line). Keep `TypeVar` only in libraries that still support 3.11 or older, and declare aliases with `type`.
