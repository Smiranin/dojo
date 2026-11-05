---
difficulty: hard
tags: [sqlalchemy, database]
source: https://docs.sqlalchemy.org/en/21/orm/session_basics.html
---

## Question

How do you manage the Session, transactions and the connection pool in a web service?

## Answer

Use one Session per request (or per task), never shared between threads or asyncio tasks, in a `with` block that commits on success and rolls back on error. The engine's connection pool (a `QueuePool` of size 5 plus 10 overflow by default) belongs to the process, so you size it against the database's connection limit and the number of worker processes.

## Explanation

The Session is "a mutable, stateful object that represents a single database transaction" that "cannot be shared among concurrent threads or asyncio tasks without careful synchronization" ("Session per thread, AsyncSession per task"); the docs (SQLAlchemy 2.1, release 2.1.8) suggest creating a Session at the start of a web request. A transaction starts automatically (autobegin), and `with Session(engine) as session, session.begin():` frames a begin/commit/rollback block where an exception calls `rollback()`. `Session.commit()` unconditionally issues `flush()` before COMMIT and releases the connection to the pool; closing the Session releases resources and the pool rolls back transactional state. `expire_on_commit` defaults to `True`. In SQLAlchemy 2.1 autoflush was simplified to flush unconditionally on every execution, ORM or Core `text()` alike (migration note, ticket #9809); the session_basics page still words it more narrowly.

The default `QueuePool` has `pool_size` 5 and allows `pool_size + max_overflow` simultaneous connections (`max_overflow` defaults to 10). `pool_pre_ping=True` emits a ping (typically `SELECT 1`) on checkout, and `pool_recycle` invalidates connections open longer than the given seconds. Pooled connections are not shared with a forked process: a child should call `engine.dispose(close=False)`, "the recommended approach".

Judgment, derived from these facts: each worker process creates its own engine and so its own pool, which means the database sees up to workers x (`pool_size` + `max_overflow`) connections, and that product must stay under the server's limit. Keep transactions short so connections return to the pool quickly.

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

engine = create_engine(DATABASE_URL, pool_size=5, max_overflow=10, pool_pre_ping=True)

def create_order(data):
    with Session(engine) as session, session.begin():   # commit or rollback
        order = Order(**data)
        session.add(order)
        session.flush()                                  # order.id is available
        return order.id
```

## Best practice

Use one Session per request via a framework dependency and one transaction per use case, with `pool_pre_ping=True` for networked databases. Set pool sizes from workers x (`pool_size` + `max_overflow`), dispose the engine in forked children, and for asyncio use `AsyncSession` per task with `async_sessionmaker(engine, expire_on_commit=False)`.
