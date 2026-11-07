---
difficulty: easy
tags: [data-model]
source: https://docs.python.org/3.15/reference/datamodel.html
---

## Question

Which of Python's built-in types are mutable and which are immutable?

## Answer

Lists, dicts and sets are mutable; numbers, strings and tuples are immutable. Mutability belongs to the type and decides whether a change happens in place.

## Explanation

The reference says an object's mutability is determined by its type: numbers, strings and tuples are immutable, dictionaries and lists are mutable. A tuple is only shallowly immutable: the list inside `(1, [2, 3])` can still change. Python 3.15 added a built-in immutable `frozendict` (PEP 814, "Added in version 3.15"); it is not a `dict` subclass and keeps insertion order.

JS/TS comparison: MDN says all JavaScript primitives, strings included, are immutable, but `Object.freeze()` is shallow: "those objects are not frozen and may be the target of property addition, removal or value re-assignment". In Python the immutable containers are separate types (`tuple`, `frozenset`, and since 3.15 `frozendict`), not a flag on an existing object.

```python
t = (1, [2, 3])
t[1].append(4)      # allowed: the list inside the tuple is mutable
print(t)            # (1, [2, 3, 4])
# t[0] = 9          # TypeError: tuples do not support item assignment
```

## Best practice

Use tuples and frozensets for values that must not change; do not treat a tuple holding mutable objects as deeply immutable. Use `frozendict` for immutable mappings on 3.15 and later and say "3.15 and later" when you do.
