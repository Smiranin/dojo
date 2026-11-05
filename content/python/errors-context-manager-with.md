---
difficulty: easy
tags: [errors]
source: https://docs.python.org/3.15/reference/compound_stmts.html
---

## Question

What is a context manager, and what does the `with` statement guarantee?

## Answer

A context manager is an object with `__enter__` and `__exit__`; `with` calls `__enter__` on the way in and `__exit__` on the way out, even when the block raises. That is why you use it for files, locks, connections and transactions.

## Explanation

If the block exits because of an exception, its type, value and traceback are passed to `__exit__()`; otherwise three `None` arguments are passed. If `__exit__()` returns false the exception is re-raised; if it returns true the exception is suppressed and execution continues after the `with`.

```python
with open("data.txt", encoding="utf-8") as f, open("out.txt", "w", encoding="utf-8") as g:
    g.write(f.read())          # both files are closed even if this raises
```

## Best practice

Use `with` for every resource that must be released instead of calling `close()` by hand; do not return a true value from `__exit__` unless you mean to swallow the exception.
