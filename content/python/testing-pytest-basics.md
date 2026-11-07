---
difficulty: easy
tags: [testing]
source: https://docs.pytest.org/en/stable/getting-started.html
---

## Question

How does pytest find and run your tests, and how do you write an assertion?

## Answer

It collects files named `test_*.py` or `*_test.py` and runs the functions whose names start with `test_`. You write a plain `assert`, and pytest rewrites it to show the values on failure.

## Explanation

pytest (docs for pytest 9.2.0, changelog dated 2026-10-27) runs all files of the form `test_*.py` or `*_test.py` in the current directory and its subdirectories, finds `test_` prefixed functions, and skips classes not prefixed with `Test`. Only plain `assert` statements are needed because of assertion introspection: failing assertions are reported by rewriting `assert` statements before they run. Use `pytest.raises` to assert an exception; its `match` parameter is matched with `re.search()`.

```python
import pytest

def test_total():
    assert sum([1, 2, 3]) == 6

def test_rejects_negative():
    with pytest.raises(ValueError, match="negative"):
        withdraw(-5)
```

## Best practice

Name tests for behaviour, one behaviour per test, and run `pytest -q` locally and in CI.
