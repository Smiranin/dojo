---
difficulty: hard
tags: [internals, data-model]
source: https://docs.python.org/3.15/reference/datamodel.html
---

## Question

How does CPython manage memory, and what can still leak or be freed late?

## Answer

CPython frees most objects as soon as their reference count reaches zero, and a cyclic garbage collector handles reference cycles later. Because collection of cycles is delayed and finalization timing is not guaranteed, resources like files must be closed explicitly with `with`.

## Explanation

The reference says CPython uses a reference-counting scheme with delayed detection of cyclically linked garbage, which collects most objects as soon as they become unreachable but is not guaranteed to collect circular garbage; it adds "Do not depend on immediate finalization of objects ... (so you should always close files explicitly)". The `gc` module's collector supplements reference counting and groups objects into three generations.

Version history interviewers like: immortal objects (PEP 683, Python 3.12) have a reference count that never reaches zero. Python 3.14 introduced an incremental collector that was reverted in 3.14.5: the 3.15 docs say "Generation 1 is reintroduced to maintain GC behavior from 3.13" ("Changed in version 3.14.5"), so 3.15 uses the generational collector; `gc.get_stats()` gained `duration` and `candidates` in 3.15.

JS/TS comparison: MDN says JavaScript "automatically allocates memory ... and frees it when they are not used anymore (garbage collection)" and that for finalization callbacks "there is no guarantee of when the callback will be called, or if it will be called at all"; Python's refcounting usually releases promptly, yet its docs also tell you not to rely on it.

```python
import gc, weakref

class Node:
    def __init__(self): self.other = None

a, b = Node(), Node()
a.other, b.other = b, a      # reference cycle: counts never reach 0
ref = weakref.ref(a)
del a, b
print(ref() is not None)     # True: the cycle is still alive
gc.collect()
print(ref() is None)         # True: the cyclic collector freed it
```

## Best practice

Release resources with context managers, not `__del__` or refcount timing. Use `weakref` for caches and mappings holding large objects ("where it's desired that a large object not be kept alive solely because it appears in a cache"). Do not tune `gc` without measuring.
