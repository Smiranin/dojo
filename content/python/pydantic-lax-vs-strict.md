---
difficulty: medium
tags: [pydantic, typing]
source: https://pydantic.dev/docs/validation/latest/concepts/strict_mode/
---

## Question

What does this print, and what changes if you enable strict mode?

```python
from pydantic import BaseModel, ValidationError

class Item(BaseModel):
    id: int
    price: float

print(Item(id="7", price="9.5"))
try:
    Item(id="abc", price=1)
except ValidationError:
    print("invalid")
```

## Answer

It prints `id=7 price=9.5` and then `invalid`. By default Pydantic validates in lax mode and coerces compatible input, so the string `"7"` becomes the integer 7 while `"abc"` cannot be converted; in strict mode the first call fails too.

## Explanation

The strict-mode page (Pydantic docs, latest = v2.14.3) says Pydantic by default attempts to coerce values to the desired type when possible: the string `'123'` given for an `int` is converted to `123`. Strict mode switches that off per call (`MyModel.model_validate(data, strict=True)`), per field (`Field(strict=True)`) or per model (`model_config = ConfigDict(strict=True)`). The printed form follows the docs' own example, where `print(m)` gives `id=123 name='James' signup_ts=None`.

```python
from pydantic import ConfigDict

class StrictItem(BaseModel):
    model_config = ConfigDict(strict=True)
    id: int

StrictItem(id="7")      # raises ValidationError: no coercion in strict mode
```

## Best practice

Use strict mode for service-to-service contracts and for fields where silent coercion hides client bugs (ids, amounts). Keep lax mode for human-facing input.
