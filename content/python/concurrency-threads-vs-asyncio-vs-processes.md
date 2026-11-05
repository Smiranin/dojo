---
difficulty: hard
tags: [async]
source: https://docs.python.org/3.15/library/concurrent.futures.html
---

## Question

For a backend service, how do you choose between threads, asyncio and multiprocessing?

## Answer

For I/O-bound work use asyncio when your libraries support it, or a thread pool when they are blocking; for CPU-bound pure Python use processes, because the GIL stops threads from running Python bytecode in parallel. A free-threaded build lets threads use several cores, but it is optional and every dependency must support it.

## Explanation

The GIL is always released during I/O, which is why threads overlap waits but not computation. `ThreadPoolExecutor` uses a pool of threads, `ProcessPoolExecutor` uses separate processes (default `max_workers` is `os.process_cpu_count()`) and, since 3.14, `InterpreterPoolExecutor` runs each thread in its own interpreter; the default `max_workers` of `ThreadPoolExecutor` is `min(32, (os.process_cpu_count() or 1) + 4)` since 3.13. Inside asyncio, blocking code must go to an executor or `to_thread`. Processes cost extra memory and start-up and need picklable data (see the multiprocessing Card). Free-threading (PEP 779) and its limits are in the GIL Card.

JS/TS comparison: Node documents the same split: its asynchronous I/O is efficient, `worker_threads` are for CPU-intensive JavaScript, and `child_process.fork()` spawns a new Node.js process with an IPC channel.

```python
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

with ThreadPoolExecutor() as pool:       # I/O-bound, blocking libraries
    pages = list(pool.map(download, urls))

with ProcessPoolExecutor() as pool:      # CPU-bound pure Python
    results = list(pool.map(crunch, chunks))
```

## Best practice

Profile first: is the bottleneck waiting or computing? Keep one concurrency model per code path, never put blocking calls on the event loop, and test the free-threaded build with your actual dependencies before adopting it.
