---
difficulty: easy
tags: [fastapi, http]
source: https://fastapi.tiangolo.com/
---

## Question

What is FastAPI and what do you get out of the box?

## Answer

FastAPI is a Python web framework for building APIs on standard type hints, built on Starlette for the web parts and Pydantic for the data parts. From your annotations you get request validation and automatic interactive API documentation (Swagger UI and ReDoc).

## Explanation

The docs describe FastAPI as "a modern, fast (high-performance), web framework for building APIs with Python based on standard Python type hints", standards-based on OpenAPI and JSON Schema; the `FastAPI` class inherits directly from `Starlette`. You declare path operations with decorators and let parameter types drive parsing and validation; Pydantic models describe request and response bodies. `fastapi dev` starts a local server with auto-reload and `fastapi[standard]` installs the standard optional dependencies. The FastAPI release notes show 0.136.0 (2026-04-16) and 0.162.0 (2026-10-23), so this describes the 0.136+ line.

Contrast: Flask is a "microframework" that does not bring validation and API docs by itself.

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items")
def create_item(item: Item) -> Item:
    return item          # docs at /docs, validated body in, validated JSON out
```

## Best practice

Use Pydantic models for request and response bodies and keep path functions thin. Use `fastapi dev` locally and `fastapi run` in production.
