---
difficulty: easy
tags: [testing]
source: https://docs.pytest.org/en/stable/how-to/parametrize.html
---

## Question

How do you run the same test with many inputs in pytest?

## Answer

Use `@pytest.mark.parametrize` with the argument names and a list of value tuples; pytest runs the test once for each tuple.

## Explanation

The decorator "enables parametrization of arguments for a test function"; with three tuples the test function runs three times, using them in turn (pytest 9.2.0, changelog dated 2026-10-27).

```python
import pytest

@pytest.mark.parametrize(
    "raw, expected",
    [("3", 3), (" 4 ", 4), ("-1", -1)],
)
def test_parse_int(raw, expected):
    assert int(raw) == expected
```

## Best practice

Use parametrize for table-style cases and edge values instead of a loop inside one test, and keep each parametrized test about one behaviour.
