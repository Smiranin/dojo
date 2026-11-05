---
difficulty: easy
tags: [functions]
source: https://docs.python.org/3.15/faq/programming.html
---

## Question

What does this print, and why?

```python
def add(item, bucket=[]):
    bucket.append(item)
    return bucket

print(add(1))
print(add(2))
```

## Answer

It prints `[1]` and then `[1, 2]`. The default list is created once, when the function is defined, so every call without `bucket` shares it.

## Explanation

The FAQ says default values are created exactly once, when the function is defined, and that if the object is changed later calls see the change; the tutorial warns that this matters when the default is a mutable object such as a list, a dictionary or instances of most classes.

JS/TS comparison: MDN says a JavaScript default argument "is evaluated at call time. Unlike with Python (for example), a new object is created each time the function is called", so the same-looking code is safe in JavaScript.

## Best practice

Use `None` as the default and create the object inside the function.

```python
def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket
```
