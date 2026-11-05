---
difficulty: medium
tags: [errors]
source: https://docs.python.org/3.15/tutorial/errors.html
---

## Question

What does this print, and what has Python changed about it recently?

```python
def f():
    try:
        raise ValueError("boom")
    finally:
        return "done"

print(f())
```

## Answer

It prints `done` and the `ValueError` vanishes. A `return` in `finally` discards the saved exception; since Python 3.14 the compiler warns about this with a `SyntaxWarning` (PEP 765).

## Explanation

If the `finally` clause executes a `return`, `break` or `continue`, the saved exception is discarded and not re-raised, and a `return` overrides the value from the `try` clause; the tutorial calls this confusing and therefore discouraged and says "From version 3.14 the compiler emits a SyntaxWarning for it (see PEP 765)". PEP 765 leaves open whether it ever becomes a `SyntaxError`. The warning appears at compile time, so a runtime `warnings` filter affects only code compiled after the filter.

## Best practice

Keep `finally` for cleanup only and return after the `try` statement; treat the 3.14+ warning as an error in CI.

```python
def f():
    try:
        return risky()
    finally:
        cleanup()            # cleanup only; any exception propagates
```
