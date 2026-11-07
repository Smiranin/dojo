---
difficulty: easy
tags: [sqlalchemy, database]
source: https://docs.sqlalchemy.org/en/21/tutorial/index.html
---

## Question

What is SQLAlchemy, and what is the difference between Core and the ORM?

## Answer

SQLAlchemy is Python's main database toolkit. Core is the foundation (engine, connections, SQL expressions); the ORM builds on Core to map classes to tables and work with objects through a `Session`.

## Explanation

The tutorial (SQLAlchemy 2.1 docs, release 2.1.8) calls Core "the foundational architecture for SQLAlchemy as a 'database toolkit'" and the ORM an optional layer that builds on Core with object relational mapping capabilities. An `Engine` is created with `create_engine()` and has not actually tried to connect to the database yet; connecting is lazy. SQLAlchemy 2.1.0 was released on September 24, 2026 and requires Python 3.11 or newer. The style used here, `select()` run through a `Session`, is the 2.0 style current code uses.

```python
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

engine = create_engine("sqlite+pysqlite:///:memory:", echo=True)

with Session(engine) as session:                  # ORM, built on Core
    first = session.scalars(select(User)).first()
```

## Best practice

Create one `Engine` per database for the life of the process, use the ORM for domain objects and Core for reports, and always bind values as parameters (see the sqlite3 Card) instead of formatting SQL.
