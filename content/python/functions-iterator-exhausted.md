---
difficulty: easy
tags: [functions]
source: https://docs.python.org/3.15/glossary.html
---

## Question

What does this print, and what is the difference between an iterable and an iterator?

```python
squares = (n * n for n in range(3))
print(list(squares))
print(list(squares))
```

## Answer

It prints `[0, 1, 4]` and then `[]`. A generator is an iterator that is consumed as you go, whereas an iterable such as a list hands out a fresh iterator each time you loop.

## Explanation

The glossary defines an iterable as an object capable of returning its members one at a time, which gives an iterator when passed to `iter()`; an iterator is a stream of data whose `__next__()` returns successive items and raises `StopIteration` when none are left. An iterator returns itself from `__iter__()`, so a second pass sees nothing.

JS/TS comparison: the same protocol pair exists in JavaScript: MDN says an iterable implements `[Symbol.iterator]()`, an iterator implements `next()`, generator objects "are iterable iterators", and after `done: true` later `next()` calls are expected to keep returning `done: true`.

## Best practice

If you need several passes, materialise once with `list(...)` or iterate a re-iterable collection; do not share one generator between consumers.

```python
squares = [n * n for n in range(3)]   # a list can be iterated again and again
print(list(squares), list(squares))   # [0, 1, 4] [0, 1, 4]
```
