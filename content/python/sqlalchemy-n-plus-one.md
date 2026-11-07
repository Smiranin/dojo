---
difficulty: medium
tags: [sqlalchemy, database]
source: https://docs.sqlalchemy.org/en/21/orm/queryguide/relationships.html
---

## Question

What is the N+1 query problem in an ORM, and how do you avoid it in SQLAlchemy?

## Answer

By default relationships are lazy loaded, so looping over N parent objects and touching a relationship emits one extra SELECT per parent, N+1 in total. Avoid it with an eager-loading option such as `selectinload()` (a second SELECT for all parents) or `joinedload()` (a JOIN).

## Explanation

"By default, all inter-object relationships are lazy loading", which the docs (SQLAlchemy 2.1, release 2.1.8) call the "N plus one problem" ("there will be N+1 SELECT statements emitted"). `selectinload()` emits a second (or more) SELECT statement; `joinedload()` applies a JOIN to the given SELECT and then "the `Result.unique()` method must be applied to the returned result".

Under asyncio lazy loading is an error, not only slowness: the docs warn that "special care must be taken to avoid lazy loading or other expired-attribute access", "no implicit IO is allowed", and call `selectinload()` "the most useful eager loading strategy". The `MissingGreenlet` error is "nearly always due to the use of lazy loading" with the ORM under asyncio. In 2.1 the `greenlet` dependency is no longer installed by default: use `pip install sqlalchemy[asyncio]` for the asyncio extension.

```python
from sqlalchemy import select
from sqlalchemy.orm import selectinload

stmt = select(Author).options(selectinload(Author.books))
for author in session.scalars(stmt):
    print(author.name, [b.title for b in author.books])   # no extra queries
```

## Best practice

Load what the response needs explicitly (`selectinload` for collections, `joinedload` for many-to-one). In async code never rely on lazy loading, and set `expire_on_commit=False` in `async_sessionmaker` as the asyncio docs advise.
