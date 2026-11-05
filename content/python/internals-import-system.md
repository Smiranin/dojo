---
difficulty: hard
tags: [internals, packaging]
source: https://docs.python.org/3.15/reference/import.html
---

## Question

What actually happens when you `import` a module, and why do circular imports cause trouble?

## Answer

Python first checks `sys.modules`; if the name is missing, finders on `sys.meta_path` locate the module and a loader executes it, and the result is cached in `sys.modules` and bound to your name. The module is placed in `sys.modules` before its code runs, so in a cycle the other side can see a half-initialised module whose later names do not exist yet.

## Explanation

The `import` statement combines a search with a binding to a local name. `sys.modules` is a cache of previously imported modules; otherwise Python searches `sys.meta_path`, and the protocol consists of finders and loaders. Adding the module to `sys.modules` beforehand prevents unbounded recursion.

Version notes: `find_module()` was removed in 3.12 (use `find_spec()`); "The `load_module` method is no longer used" in 3.15. Python 3.15 changed several circular-import details: the import system acquires per-module locks in hierarchical order, and `importlib.import_module()` now returns the partially initialized module in a circular import split across threads, as the `import` statement already did, instead of raising `_DeadlockError`. Python 3.15 also adds explicit lazy imports (PEP 810): `lazy import json` defers loading until first use, raises errors at first use, is only permitted at module scope (not in functions, classes or `try` blocks) and cannot be used with star or future imports; the new `ImportCycleError` (Added in version 3.15) is an `ImportError` subclass raised when a lazy import fails because it tries to import itself.

```python
# a.py
import b
def fa(): return "a"

# b.py
import a            # a is already in sys.modules, but fa is not defined yet
print(a.fa())        # fails: a is only partially initialised
```

## Best practice

Break cycles by moving shared code into a third module, or import the module and use it inside functions; do not manipulate `sys.modules`. On 3.15 use `lazy import` at module scope for heavy rarely-used modules to cut start-up time, accepting that import errors move to first use.
