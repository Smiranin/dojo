---
difficulty: medium
tags: [sqlalchemy, typing]
source: https://docs.sqlalchemy.org/en/21/orm/declarative_tables.html
---

## Question

How do you define an ORM model in SQLAlchemy 2.x, and how does the type hint relate to the column?

## Answer

Subclass `DeclarativeBase`, then declare each column as an annotated attribute: `id: Mapped[int] = mapped_column(primary_key=True)`. The annotation drives the column type and nullability, so `Mapped[str | None]` makes a nullable column.

## Explanation

The `DeclarativeBase` superclass supersedes the `declarative_base()` function ("Changed in version 2.0"), and `mapped_column` is "new as of the SQLAlchemy 2.0 series" (SQLAlchemy 2.1 docs, release 2.1.8); the legacy forms still work but are not the current idiom. In the absence of explicit `nullable`, `typing.Optional[]` (or `| None`) in the `Mapped` annotation means `NULL` and its absence means `NOT NULL`; `mapped_column(nullable=...)`, when present, takes precedence. Use `mapped_column(String(50))` for an explicit SQL type. Keep ORM classes apart from Pydantic API schemas.

```python
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    nickname: Mapped[str | None] = mapped_column(String(30))
```

## Best practice

Use the typed 2.0 declarative style for every model and let the annotation state nullability.
