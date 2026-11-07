---
difficulty: medium
tags: [errors, functions]
source: https://docs.python.org/3.15/library/contextlib.html
---

## Question

How do you write your own context manager with `contextlib.contextmanager`, and why does `try/finally` around the `yield` matter?

## Answer

You write a generator that does setup, yields once and does cleanup afterwards; the decorator turns it into a context manager. Put the cleanup in `finally`, because an exception from the `with` block is re-raised inside the generator at the `yield`.

## Explanation

`@contextmanager` defines a factory for `with` statement context managers without a class or separate `__enter__`/`__exit__`; if an unhandled exception occurs in the block it is reraised inside the generator at the point where the `yield` occurred, so without `try/finally` the cleanup is skipped. Related helpers: `suppress(...)`, `closing(x)` and `ExitStack`. Version notes: since 3.12 `suppress` can suppress exceptions raised as part of a `BaseExceptionGroup`; since 3.15 decorating a generator or coroutine function with a `ContextDecorator` keeps the context manager open across iteration or await (before, it exited as soon as the generator object was created).

```python
import time
from contextlib import contextmanager

@contextmanager
def timer(label):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(label, time.perf_counter() - start)
```

## Best practice

Use `@contextmanager` for simple resources and a class for stateful or reusable ones; always wrap the `yield` in `try/finally`.
