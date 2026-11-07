---
difficulty: easy
tags: [async]
source: https://docs.python.org/3.15/library/asyncio-task.html
---

## Question

What do `async` and `await` do in Python, and what is asyncio for?

## Answer

`async def` defines a coroutine function; `await` suspends the coroutine until the awaited thing finishes and lets the event loop run other tasks meanwhile. asyncio runs many I/O-bound tasks on one thread by switching at each `await`.

## Explanation

You start the loop with `asyncio.run(main())` and run work concurrently by wrapping coroutines in tasks or a `TaskGroup` (Added in 3.11). The docs stress that "simply calling a coroutine will not schedule it to be executed". Concurrency comes only from `await` points.

JS/TS comparison: JavaScript's `async` functions "always return a promise", and a `Promise` executor "is called synchronously (as soon as the `Promise` is constructed)", so promise work starts immediately; a Python coroutine object does nothing until awaited or scheduled.

```python
import asyncio

async def fetch(n):
    await asyncio.sleep(1)       # yields to the event loop
    return n

async def main():
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch(i)) for i in range(3)]
    print([t.result() for t in tasks])   # about 1 s in total, not 3

asyncio.run(main())
```

## Best practice

Use asyncio for many concurrent network or database calls, call `asyncio.run()` once at the entry point and use async libraries inside.
