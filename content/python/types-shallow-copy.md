---
difficulty: medium
tags: [data-model]
source: https://docs.python.org/3.15/library/copy.html
---

## Question

What does this print, and why?

```python
import copy

a = [[1, 2], [3]]
b = copy.copy(a)
b[0].append(99)
b.append([4])
print(a)
print(len(b))
```

## Answer

It prints `[[1, 2, 99], [3]]` and then `3`. `copy.copy` makes a new outer list whose items are the same inner lists, so changing `b[0]` changes `a`, while appending to `b` does not.

## Explanation

A shallow copy constructs a new compound object and inserts references to the objects found in the original; a deep copy inserts copies, recursively. Plain assignment (`b = a`) copies nothing and only creates a binding.

JS/TS comparison: MDN says spread syntax makes a shallow copy ("Each array element retains its identity without getting copied") and that no native operation in JavaScript does a deep clone except `structuredClone()`, which "creates a deep clone of a value" (Baseline widely available since March 2022).

## Best practice

Copy on purpose: a shallow copy when the elements are immutable, `copy.deepcopy` when nested mutable state must be independent. On 3.13 and later `copy.replace()` creates a modified copy of dataclasses and named tuples.

```python
c = copy.deepcopy(a)
c[0].append(5)
print(a[0])      # [1, 2, 99]: the original is untouched
```
