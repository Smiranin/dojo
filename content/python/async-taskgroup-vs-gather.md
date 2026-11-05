---
difficulty: hard
tags: [async]
source: https://docs.python.org/3.15/library/asyncio-task.html
---

## Question

You must call three services concurrently and one of them fails. What happens with `asyncio.gather` and with `TaskGroup`, and which do you prefer?

## Answer

With `gather` the first exception propagates to the awaiter but the other awaitables are not cancelled and keep running. A `TaskGroup` (3.11+) cancels the remaining tasks when one fails, waits for all of them and raises the failures together as an `ExceptionGroup`, so I prefer it.

## Explanation

`gather(..., return_exceptions=False)` propagates the first raised exception immediately and the other awaitables "won't be cancelled". A `TaskGroup` is an async context manager that awaits all tasks on exit; the first time a task fails with something other than `CancelledError` the remaining tasks are cancelled, and the failures are combined in an `ExceptionGroup` (or `BaseExceptionGroup`), handled with `except*`. `CancelledError` subclasses `BaseException`, so do not swallow it. `ExceptionGroup` extends `Exception`, so `except Exception` catches it.

Version notes: `TaskGroup` Added in 3.11; 3.14 forwards `kwargs` to `loop.create_task()`; `TaskGroup.cancel()` Added in 3.15; eager task execution Added in 3.12 is "a semantic change".

JS/TS comparison: `gather` is like `Promise.all`, which MDN says "will reject immediately upon any of the input promises rejecting" and whose rejection "does not cancel the remaining operations"; `Promise.allSettled` fulfills when all promises settle. `TaskGroup` has no direct JavaScript equivalent.

```python
async def main():
    try:
        async with asyncio.TaskGroup() as tg:
            users = tg.create_task(get_users())
            orders = tg.create_task(get_orders())
    except* TimeoutError as eg:
        log.error("timeouts: %s", eg.exceptions)
        raise
    return users.result(), orders.result()
```

## Best practice

Use `TaskGroup` for related concurrent calls and an `asyncio.timeout` around it; use `gather(..., return_exceptions=True)` only when you want every result regardless of failures; never catch `CancelledError` without re-raising.
