---
difficulty: easy
tags: [pydantic, typing]
source: https://pydantic.dev/docs/validation/latest/concepts/models/
---

## Question

What is Pydantic, and what does a `BaseModel` do?

## Answer

Pydantic is a data validation library: you declare a model as a class with type-annotated fields, and it validates and converts incoming data to those types, raising a `ValidationError` on bad input. Its core validation logic is written in Rust.

## Explanation

Pydantic calls itself the most widely used data validation library for Python, with validation and serialization controlled by type annotations. Models inherit from `BaseModel` and define fields as annotated attributes; the docs (latest = v2.14.3) require Python 3.10+. `model_validate()` validates an object against the model, `model_dump()` returns a dict of the fields and `model_dump_json()` a JSON string. Pydantic raises a `ValidationError` whenever it finds an error in the data. Extra input is ignored by default (`extra='ignore'`; `'forbid'` rejects it).

Pydantic v2 renamed the v1 methods: `parse_obj()` became `model_validate()`, `dict()` became `model_dump()` and `json()` became `model_dump_json()`. The v1 names are outdated.

```python
from pydantic import BaseModel, ValidationError

class User(BaseModel):
    id: int
    email: str

u = User.model_validate({"id": "1", "email": "a@b.co"})
print(u.model_dump())            # {'id': 1, 'email': 'a@b.co'}
try:
    User.model_validate({"id": "x"})
except ValidationError:
    print("invalid")
```

## Best practice

Validate all external input (requests, config, queue messages) into models at the boundary and pass models inward. Use the v2 method names only.
