---
difficulty: medium
tags: [functions]
source: https://docs.python.org/3.15/library/functools.html
---

## Question

What is a decorator, and why do you put `functools.wraps` inside one?

## Answer

A decorator is a function that takes a function and returns another function, applied with `@name` as sugar for `f = name(f)`. `functools.wraps` copies the original's name, docstring and other metadata onto the wrapper so tools and logs still see the real function.

## Explanation

The glossary defines a decorator as "a function returning another function, usually applied as a function transformation using the `@wrapper` syntax" and calls the syntax merely syntactic sugar. `update_wrapper` assigns `__module__`, `__name__`, `__qualname__`, `__annotations__`, `__type_params__` and `__doc__` and updates `__dict__`; "Changed in version 3.12: The `__type_params__` attribute is now copied by default."

JS/TS comparison: a Python decorator is an ordinary higher-order function. JavaScript/TypeScript `@decorator` syntax is a different mechanism: the TypeScript 5.0 post (16 March 2023) calls decorators "an upcoming ECMAScript feature", says the older `--experimentalDecorators` modelled "a much older version of the decorators proposal", and says the type-checking and emit rules differ.

```python
import functools, time

def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            print(func.__name__, time.perf_counter() - start)
    return wrapper

@timed
def work(): ...
print(work.__name__)   # work, not wrapper
```

## Best practice

Always use `@functools.wraps(func)` and forward `*args, **kwargs`; keep decorators free of hidden state or document it.
