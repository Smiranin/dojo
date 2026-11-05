---
difficulty: hard
tags: [fastapi, async]
source: https://fastapi.tiangolo.com/async/
---

## Question

When should a FastAPI endpoint be `def` and when `async def`, and what goes wrong if you pick `async def` with a blocking call?

## Answer

Use `async def` when everything inside awaits non-blocking libraries; use plain `def` when you call blocking code such as a synchronous database driver, because FastAPI runs `def` endpoints in an external threadpool. A blocking call inside `async def` runs on the event loop and holds up every other request on that worker.

## Explanation

The async guide says that if a third-party library talks to a database, an API or the file system and does not support `await` ("this is currently the case for most database libraries"), you declare path operation functions with plain `def`. A normal `def` path operation "is run in an external threadpool that is then awaited, instead of being called directly (as it would block the server)". The guide's summary: use `async def` if the application does not communicate with anything that must be waited on, and "If you just don't know, use normal `def`". Starlette and FastAPI are based on AnyIO, compatible with asyncio and Trio.

Python's asyncio docs (3.15.2) explain the cost of blocking the loop: a function that computes for 1 second delays all concurrent tasks and I/O by 1 second. The trade-off: `def` endpoints are simple with blocking drivers, but each in-flight call occupies a worker thread. `async def` endpoints keep waiting calls cheap but need async drivers (for example an async SQLAlchemy engine) and a loop that never blocks; `await asyncio.to_thread(...)` can wrap one blocking call inside an `async def` endpoint. The guide is tied to the 0.136+ line only through FastAPI's dated release notes (0.136.0 on 2026-04-16, 0.162.0 on 2026-10-23).

```python
@app.get("/report")
def report():                      # blocking driver: runs in the threadpool
    return db.execute(slow_query).all()

@app.get("/prices")
async def prices(client: HttpxClient):
    return await client.get("/prices")      # non-blocking: stays on the loop

@app.get("/bad")
async def bad():
    time.sleep(5)                  # blocks the event loop: every request waits
```

## Best practice

Choose per endpoint by what it calls. Make the whole path async (async driver, async session, async client) or the whole path sync, and find blocking calls with asyncio debug mode and load tests.
