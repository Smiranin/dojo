---
difficulty: medium
tags: [async]
source: https://peps.python.org/pep-0779/
---

## Question

What does the GIL protect and what does it not?

## Answer

The GIL lets only one thread run Python bytecode at a time, which keeps the interpreter's own state and built-in types like `dict` safe, but it does not make your multi-step operations atomic, so shared data still needs locks. Free-threaded Python, without the GIL, has been officially supported since 3.14 (PEP 779), but it is optional and not the default.

## Explanation

The glossary defines the GIL as the mechanism that assures only one thread executes Python bytecode at a time; it makes the object model, including critical built-in types such as `dict`, implicitly safe against concurrent access, at the expense of much of the parallelism of multi-processor machines. The GIL is always released when doing I/O, and some extension modules release it for heavy work such as compression or hashing, so threads help I/O-bound code but not CPU-bound pure Python. Python can switch threads between bytecode instructions. The Library FAQ lists what is atomic (`L.append(x)`, `D[x] = y`) and what is not (`i = i+1`, `D[x] = D[x] + 1`) and ends "When in doubt, use a mutex!".

What free-threading changes: PEP 779 made the free-threaded build officially supported from Python 3.14 (phase II: "officially supported but still optional"; making it the default, phase III, is undecided). The build itself exists since 3.13. Threads then run Python bytecode simultaneously, so CPU-bound threaded code can use several cores; the 3.14 What's New quotes a single-threaded penalty of roughly 5-10%, and PEP 779 set 15% performance and 20% memory as the criteria.

What it does not change for application code: the build "aims to provide similar thread-safety behavior at the Python level", built-in types like `dict`, `list` and `set` use internal locks but the HOWTO recommends your own `threading.Lock` instead of relying on them, sharing one iterator between threads is generally not thread-safe, and importing a C extension not marked as supporting free threading can re-enable the GIL (with a warning); `sys._is_gil_enabled()` tells which mode runs. The official macOS binaries of 3.15 install free-threading support by default, but the default interpreter still has the GIL.

JS/TS comparison: MDN says a JavaScript agent is a thread, "the interpreter can only process one statement at a time" and each job is processed completely before another; threads (workers) share memory only through `SharedArrayBuffer`, where "atomic operations are needed" to synchronize via `Atomics`. Python threads share all memory by default, so the GIL does not save you from races in your own logic.

```python
import threading

counter = 0
lock = threading.Lock()

def work():
    global counter
    for _ in range(100_000):
        with lock:                       # without it, counter = counter + 1 can lose updates
            counter = counter + 1

threads = [threading.Thread(target=work) for _ in range(4)]
[t.start() for t in threads]; [t.join() for t in threads]
print(counter)                           # 400000
```

## Best practice

Protect shared mutable state with a `Lock` or avoid sharing it; use threads for I/O, processes (or a tested free-threaded build) for CPU work; check `sys._is_gil_enabled()` before assuming parallelism and do not move a deployment to the free-threaded build until your C-extension dependencies support it.
