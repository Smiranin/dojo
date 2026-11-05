---
difficulty: easy
tags: [sqlalchemy, database]
source: https://docs.sqlalchemy.org/en/21/tutorial/data_select.html
---

## Question

What do these two calls return, and what happened to `session.query(User)`?

```python
from sqlalchemy import select
from sqlalchemy.orm import Session

with Session(engine) as session:
    a = session.scalars(select(User).where(User.name == "ann")).all()
    b = session.execute(select(User.id, User.name)).all()
```

## Answer

`a` is a list of `User` objects, because `Session.scalars()` unwraps the first element of each row; `b` is a list of `Row` objects holding `(id, name)`. `session.query()` is the legacy style, and new code uses `select()`.

## Explanation

For both Core and ORM, the `select()` function generates a `Select` construct used for all SELECT queries (SQLAlchemy 2.1 docs, release 2.1.8), and the tutorial calls `Session.scalars()` a "highly recommended convenience method" (its example is `session.scalars(select(User)).first()`). The ORM `Query` object "is a legacy construct as of SQLAlchemy 2.0", documented under "Legacy Query API", and "2.0 style querying is now standard"; the 2.1 docs repeat both statements.

## Best practice

Write new queries with `select()` plus `session.scalars()` or `session.execute()`, and migrate `session.query()` code (SQLAlchemy 1.x style, outdated) when you touch it.

```python
user = session.scalars(select(User).where(User.id == 1)).first()
```
