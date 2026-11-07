---
difficulty: hard
tags: [internals, data-model]
source: https://docs.python.org/3.15/howto/mro.html
---

## Question

How does Python decide which method runs under multiple inheritance, and what does `super()` really do?

## Answer

Python linearizes the class hierarchy into the method resolution order, exposed as `__mro__`, and looks attributes up along it. `super()` returns a proxy for a parent or sibling class in that order, not simply "my parent", which makes cooperative multiple inheritance work.

## Explanation

The MRO is the class precedence list: the class plus the merge of its parents' linearizations, nearest ancestor first; Python raises `TypeError: MRO conflict` for ambiguous hierarchies. The MRO resolves attributes, not only methods. The tutorial says the method resolution order changes dynamically to support cooperative calls to `super()`, known elsewhere as call-next-method. The ordering was introduced in Python 2.3 and "is still used in later versions - including Python 3".

```python
class A:
    def hi(self): print("A")
class B(A):
    def hi(self): print("B"); super().hi()
class C(A):
    def hi(self): print("C"); super().hi()
class D(B, C):
    def hi(self): print("D"); super().hi()

D().hi()                                   # D B C A
print([k.__name__ for k in D.__mro__])     # ['D', 'B', 'C', 'A', 'object']
```

## Best practice

Prefer composition; use multiple inheritance only for small cooperative mixins where every class calls `super()`; inspect `Class.__mro__` when debugging.
