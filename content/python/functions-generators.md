---
difficulty: easy
tags: [functions]
source: https://docs.python.org/3.15/tutorial/classes.html
---

## Question

What is a generator and why would you use one instead of building a list?

## Answer

A generator is a function with `yield` (or a generator expression) that produces values one at a time and remembers its state between them. It uses constant memory and can deliver results before the whole sequence exists.

## Explanation

The tutorial calls generators "a simple and powerful tool for creating iterators" whose `__iter__()` and `__next__()` methods are created automatically. A generator iterator also supports `send()` to push a value in and `close()`, which lets pending `finally` clauses run.

JS/TS comparison: it is the counterpart of a JavaScript `function*`; MDN says calling one "returns a new `Generator` object, which conforms to the iterator protocol" and that it "can be exited and later re-entered, with its context (variable bindings) saved".

```python
def read_lines(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line.rstrip("\n")

first = next(read_lines("big.log"))
```

## Best practice

Return a generator when callers iterate once over large data; return a list when they need `len`, indexing or several passes. Pass `encoding` explicitly to `open` (UTF-8 is the default since 3.15, PEP 686).
