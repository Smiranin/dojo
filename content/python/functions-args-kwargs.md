---
difficulty: easy
tags: [functions]
source: https://docs.python.org/3.15/tutorial/controlflow.html
---

## Question

What do `*args` and `**kwargs` do in a function signature?

## Answer

`*args` collects extra positional arguments into a tuple and `**kwargs` collects extra keyword arguments into a dict. Parameters after `*args` can only be passed by keyword.

## Explanation

The tutorial says these arguments are wrapped up in a tuple, that a final `**name` parameter receives a dictionary, and that any formal parameters after `*args` are keyword-only; a `/` marks positional-only parameters and a bare `*` starts the keyword-only ones.

JS/TS comparison: `*args` resembles a JavaScript rest parameter, but MDN says a rest parameter collects the remaining arguments "as an array" (`Array` instances), whereas Python gives a tuple.

```python
def log(level, *args, sep=" ", **extra):
    print(level, sep.join(map(str, args)), extra)

log("INFO", "a", 1, user="ann")   # INFO a 1 {'user': 'ann'}
```

## Best practice

Make options keyword-only with `*` so call sites stay readable; avoid blind `**kwargs` forwarding that hides the real signature from readers and type checkers.
