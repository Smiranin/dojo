---
difficulty: medium
tags: [testing]
source: https://docs.pytest.org/en/stable/how-to/fixtures.html
---

## Question

What is a pytest fixture, how do you do teardown, and what does `scope` mean?

## Answer

A fixture provides test setup; a test requests it by naming it as an argument. A `yield` fixture runs its teardown after the `yield`, and `scope` (function, class, module, package or session) says how long one fixture instance lives.

## Explanation

Test functions request the fixtures they require by declaring them as arguments. The `function` scope is the default, and the fixture is destroyed at the end of the test. "Yield" fixtures `yield` instead of `return`, and any teardown code is placed after the `yield`. A fixture in `conftest.py` can be used by tests in multiple test modules in that directory (pytest 9.2.0, changelog dated 2026-10-27).

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

@pytest.fixture(scope="session")
def engine():
    return create_engine("sqlite+pysqlite:///:memory:")

@pytest.fixture
def session(engine):
    with Session(engine) as s:
        yield s            # teardown code goes after the yield
        s.rollback()
```

## Best practice

Keep fixtures small and composable, create costly resources (an engine) at a wider scope and reset state per test, and put shared fixtures in `conftest.py`.
