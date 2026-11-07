---
difficulty: easy
tags: [typing]
source: https://mypy.readthedocs.io/en/stable/getting_started.html
---

## Question

Does Python enforce type hints at runtime, and what do you use them for?

## Answer

No: the runtime does not enforce annotations; they are for tools such as type checkers, IDEs and linters. You get checking by running a static type checker like mypy in CI and the editor.

## Explanation

The `typing` docs say the runtime does not enforce function and variable type annotations. mypy's getting-started page (mypy 2.4.1 documentation) says it type checks your code statically, "without ever running your code, just like a linter", and reports a wrong call such as `greeting(3)` as an incompatible argument type; it requires Python 3.10 or later to run. Libraries can read hints at runtime: FastAPI is built on standard Python type hints and Pydantic's validation is "controlled by type annotations".

Version notes: since Python 3.14 (PEP 649/749) annotations are no longer evaluated eagerly and "It is no longer necessary to enclose annotations in strings if they contain forward references"; `from __future__ import annotations` keeps working and will be deprecated only after Python 3.13 reaches end of life. `Optional[X]` is equivalent to `X | None`, which can be written directly since Python 3.10.

JS/TS comparison: TypeScript's compiler checks types before the code runs and erases them ("Type annotations never change the runtime behavior of your program"); Python has no checking compile step, so a wrong hint still runs unless you run a checker, the counterpart of `tsc` with `noEmit` ("use TypeScript as ... a source code type-checker").

```python
def double(x: int) -> int:
    return x * 2

print(double("ab"))    # runs and prints "abab"; mypy reports an error
```

## Best practice

Annotate public signatures first, run mypy (or another checker) as a required CI step, and write `list[int]` and `int | None` instead of `typing.List` and `Optional` in new code.

```sh
mypy src/       # fails the build on the call above
```
