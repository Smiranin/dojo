---
difficulty: medium
tags: [pydantic]
source: https://pydantic.dev/docs/validation/latest/concepts/validators/
---

## Question

How do you add custom validation to a Pydantic v2 model, and what replaced the v1 `@validator`?

## Answer

Use `@field_validator("field")` for one field and `@model_validator` for rules across fields. They replace the v1 `@validator` and `@root_validator`, which are deprecated.

## Explanation

Field validators have modes (Pydantic docs, latest = v2.14.3): after (the default, runs after Pydantic's internal validation), before (runs before parsing, such as coercion of a `str` to an `int`), plain (terminates validation immediately) and wrap (the most flexible). `@model_validator` validates the entire model's data with the same modes. A field validator is written with `@field_validator(...)` over `@classmethod`; a model validator in `after` mode is an instance method that returns `self`. The migration guide says `@validator` and `@root_validator` have been deprecated in favour of `@field_validator` and `@model_validator`.

```python
from typing import Self
from pydantic import BaseModel, field_validator, model_validator

class Signup(BaseModel):
    password: str
    password_repeat: str

    @field_validator("password", mode="after")
    @classmethod
    def long_enough(cls, value: str) -> str:
        if len(value) < 12:
            raise ValueError("at least 12 characters")
        return value

    @model_validator(mode="after")
    def passwords_match(self) -> Self:
        if self.password != self.password_repeat:
            raise ValueError("Passwords do not match")
        return self
```

## Best practice

Prefer declarative constraints (`Field(gt=0)`, `Field(max_length=3)`) and keep validators for rules you cannot declare. Raise `ValueError` with a clear message, and keep rules that need a database in the service layer.
