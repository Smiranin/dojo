---
difficulty: easy
tags: [data-model, functions]
source: https://docs.python.org/3.15/faq/programming.html
---

## Question

Is Python pass-by-value or pass-by-reference?

## Answer

Neither: arguments are passed by assignment, so the parameter is a new name bound to the same object. Mutating that object is visible to the caller; rebinding the name is not.

## Explanation

The FAQ says arguments are passed by assignment, that assignment only creates references, that there is therefore no alias between the caller's name and the parameter, and "consequently no call-by-reference".

JS/TS comparison: MDN describes JavaScript the same way: parameters are passed by value, reassigning a parameter is not reflected in the caller, but "if the function changes the object's properties, that change is visible outside the function". The trap for JavaScript developers is `+=`: on a list it mutates in place, on an int it rebinds.

```python
def add(items):
    items.append(1)      # mutates the caller's list
def rebind(items):
    items = [0]          # rebinds the local name only
nums = []
add(nums); rebind(nums)
print(nums)              # [1]
```

## Best practice

Do not mutate arguments unless the function name says so; return the new value, or a tuple when you need several results (the FAQ's "best choice").
