---
difficulty: easy
tags: [fastapi, http]
source: https://fastapi.tiangolo.com/tutorial/query-params/
---

## Question

What does this endpoint return for `GET /items/5?short=maybe`, and why?

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
def read_item(item_id: int, short: bool = False):
    return {"item_id": item_id, "short": short}
```

## Answer

It returns a `422` validation error and never calls the function, because `maybe` is not a valid boolean for the `short` query parameter. FastAPI converts and validates path and query parameters against their type hints before your code runs.

## Explanation

Parameters declared with Python types are converted to that type and validated against it; "an unrecognized value (for example, `?short=maybe`) produces a `422` validation error". `item_id` is a path parameter because its name appears in the path, and `short` is an optional query parameter because it has a default. FastAPI raises a `RequestValidationError` internally. A non-integer path value such as `/items/foo` fails the same way with an `int_parsing` error ("Input should be a valid integer, unable to parse string as an integer"). The FastAPI release notes (0.136.0 dated 2026-04-16, 0.162.0 dated 2026-10-23) anchor this to the 0.136+ line.

## Best practice

Declare precise constraints on parameters and let the framework reject bad input. The docs use `Annotated[int, Path(..., ge=1)]` and `Query(min_length=3, max_length=50)` forms (`Annotated` support since FastAPI 0.95.0).

```python
from typing import Annotated
from fastapi import Query

@app.get("/search")
def search(q: Annotated[str | None, Query(min_length=3, max_length=50)] = None):
    return {"q": q}      # q shorter than 3 characters gives a 422
```
