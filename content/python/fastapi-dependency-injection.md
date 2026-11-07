---
difficulty: medium
tags: [fastapi]
source: https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/
---

## Question

What is dependency injection in FastAPI, and how do you use it for something like a database session?

## Answer

You declare what a path function needs as parameters with `Depends(provider)`, and FastAPI calls the provider for each request and passes the result in. A provider that uses `yield` gives per-request setup and cleanup, which is the standard way to open and close a database session.

## Explanation

FastAPI has a "very powerful but intuitive Dependency Injection system": path operation functions declare the things they require, and `Depends` takes a single parameter that you do not call yourself. For dependencies with `yield`, only the code before and including `yield` runs before the response is created, and the code after it normally runs after the response is sent.

Since FastAPI 0.121.0 (2025-11-03) `Depends(scope="function")` ends such a dependency right after the path function and before the response is sent, while `scope="request"` (the default) ends it after the response; 0.121.1 (2025-11-08) fixed `Depends(func, scope='function')` for top-level dependencies. `app.dependency_overrides` is a plain `dict` for tests: the key is the original dependency and the value the replacement. The docs' own database tutorial uses the same pattern with SQLModel, which is built on SQLAlchemy and Pydantic.

```python
from typing import Annotated
from fastapi import Depends, FastAPI
from sqlalchemy import select
from sqlalchemy.orm import Session

def get_session():
    with Session(engine) as session:
        yield session            # cleanup runs after the response

SessionDep = Annotated[Session, Depends(get_session)]

@app.get("/users/{user_id}")
def read_user(user_id: int, session: SessionDep):
    return session.scalars(select(User).where(User.id == user_id)).first()

# in a test:
app.dependency_overrides[get_session] = lambda: fake_session
```

## Best practice

Put sessions, settings, authentication and pagination in dependencies. Override them in tests with `dependency_overrides` and reset it to `{}` afterwards.
