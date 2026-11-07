---
difficulty: medium
tags: [async]
source: https://docs.python.org/3.15/library/asyncio-task.html
---

## Question

How do you put a timeout on an awaited call in asyncio?

## Answer

Wrap it in `async with asyncio.timeout(seconds):` (3.11+), or use `asyncio.wait_for`. On expiry the work is cancelled and a built-in `TimeoutError` is raised.

## Explanation

`asyncio.timeout()` returns an async context manager that limits the time spent waiting on something, so it covers a whole block (several awaits or a `TaskGroup`). It was Added in 3.11; also in 3.11 `wait_for` started raising the built-in `TimeoutError` instead of `asyncio.TimeoutError`.

JS/TS comparison: MDN says `AbortSignal.timeout()` returns a signal that aborts after the given time with a `TimeoutError` (Baseline widely available since April 2024) and that racing a promise against a rejecting timer works, but "One promise finishing does not automatically cancel the other"; MDN notes a `Promise` has no first-class cancellation protocol and points to `AbortController`.

```python
async def get_profile(client, user_id):
    try:
        async with asyncio.timeout(2.0):
            return await client.get(f"/users/{user_id}")
    except TimeoutError:
        return None
```

## Best practice

Put an explicit timeout on every outbound call from a service; choose per-dependency values and handle `TimeoutError` deliberately (retry, fallback or fail).
