---
difficulty: medium
tags: [functions]
source: https://docs.python.org/3.15/faq/programming.html
---

## Question

What does this print, and how would you fix it?

```python
funcs = []
for i in range(3):
    funcs.append(lambda: i)
print([f() for f in funcs])
```

## Answer

It prints `[2, 2, 2]`. The lambdas share the variable `i` and read it when called, after the loop has ended; bind the value with a default argument, `lambda i=i: i`.

## Explanation

The FAQ explains that `x` "is not local to the lambdas, but is defined in the outer scope, and it is accessed when the lambda is called — not when it is defined", that the behaviour applies to regular functions too, and that the fix is saving the value in a variable local to the lambda (`lambda n=x: n**2`).

JS/TS comparison: this is the classic closure-in-a-loop problem; MDN says that with `var` the closures "share the same single lexical environment" and that using `let` or `const` makes every closure bind a block-scoped variable. A Python `for` loop has no per-iteration binding, so the `let` behaviour does not exist by default.

## Best practice

Bind loop values explicitly with a default argument whenever you build callbacks in a loop.

```python
funcs = [(lambda i=i: i) for i in range(3)]
print([f() for f in funcs])   # [0, 1, 2]
```
