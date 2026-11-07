---
difficulty: easy
tags: [database, stdlib]
source: https://docs.python.org/3.15/library/sqlite3.html
---

## Question

What is wrong with this query, and how do you fix it?

```python
import sqlite3

def find_user(conn: sqlite3.Connection, name: str):
    return conn.execute(f"SELECT * FROM users WHERE name = '{name}'").fetchone()

find_user(conn, "x' OR '1'='1")
```

## Answer

The value is pasted into the SQL text, so the input `x' OR '1'='1` changes the query and matches any row: that is SQL injection. Pass values as parameters, `execute("... WHERE name = ?", (name,))`, so the driver binds them separately from the SQL.

## Explanation

The `sqlite3` docs (Python 3.15.2) warn against assembling queries with Python's string operations because they are vulnerable to SQL injection attacks, and the tutorial says to always use placeholders instead of string formatting to bind Python values. A statement may use question-mark (qmark) or named placeholders; qmark parameters must be a sequence whose length matches the placeholders. `sqlite3` follows the DB-API 2.0 specification (PEP 249), the common interface of Python database drivers.

Version notes: `connect()` gained an `autocommit` parameter in 3.12 (`False` is "the recommended value"; the current default is `LEGACY_TRANSACTION_CONTROL`). Python 3.13 emits a `ResourceWarning` if a `Connection` is deleted without `close()`. Python 3.15 makes all `connect()` parameters except `database` keyword-only. The connection context manager commits or rolls back but "neither implicitly opens a new transaction nor closes the connection".

```python
row = conn.execute(
    "SELECT * FROM users WHERE name = ?", (name,)
).fetchone()
```

## Best practice

Never build SQL with f-strings or `%`; use placeholders for every value (an ORM binds parameters for you). Close connections explicitly or with `contextlib.closing()`.
