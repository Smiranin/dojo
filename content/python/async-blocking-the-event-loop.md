---
difficulty: medium
tags: [async]
source: https://docs.python.org/3.15/library/asyncio-dev.html
---

## Question

What happens if you call a blocking function like `time.sleep` or `requests.get` inside a coroutine, and how do you fix it?

## Answer

It blocks the whole event loop, so every other task stalls until the call returns. Use the async equivalent, or push the blocking function to a worker thread with `asyncio.to_thread`.

## Explanation

The docs say blocking (CPU-bound) code should not be called directly: a function that computes for 1 second delays all concurrent tasks and I/O operations by 1 second; an executor can run it in a different thread, a different interpreter or a different process. `asyncio.to_thread()` (Added in 3.9) runs a function in a separate thread; "Due to the GIL, `asyncio.to_thread()` can typically only be used to make IO-bound functions non-blocking". `InterpreterPoolExecutor` was added in 3.14.

JS/TS comparison: MDN's execution model says a job that takes too long means the application "is unable to process user interactions", and Node's `worker_threads` docs say workers are for CPU-intensive JavaScript and "do not help much with I/O-intensive work"; Python's `to_thread` helps the opposite case (blocking I/O) because of the GIL.

```python
import asyncio, time

def blocking_report():          # sync, slow, I/O-bound
    time.sleep(2)
    return "ok"

async def handler():
    return await asyncio.to_thread(blocking_report)   # loop stays free
```

## Best practice

Never call blocking I/O inside `async def`; enable asyncio debug mode to log slow callbacks; send CPU-bound work to a process pool via an executor.
