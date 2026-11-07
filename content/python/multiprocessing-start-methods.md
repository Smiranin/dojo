---
difficulty: medium
tags: [async]
source: https://docs.python.org/3.15/library/multiprocessing.html
---

## Question

How does `multiprocessing` start child processes, and why do you need the `if __name__ == "__main__"` guard?

## Answer

There are three start methods: `spawn` starts a fresh interpreter, `fork` forks the parent and `forkserver` forks from a helper server process. Spawn and forkserver import the main module in the child, so without the guard the child would run your top-level code again and start more processes.

## Explanation

Defaults: `spawn` on Windows and macOS; since Python 3.14 `forkserver` on Linux and other POSIX platforms (was `fork`; "changed from fork to forkserver to retain the performance but avoid common multithreaded process incompatibilities", gh-84559); since 3.15.1 `spawn` is the default when there is no writable temporary directory. Code that needs `fork` must request it with `get_context()` or `set_start_method()`; `ProcessPoolExecutor` follows the change and needs `mp_context=multiprocessing.get_context("fork")`. The docs' programming guidelines say to "make sure that the main module can be safely imported by a new Python interpreter without causing unintended side effects (such as starting a new process)", and, for spawn and forkserver, that all arguments to `Process` must be picklable.

JS/TS comparison: Node's `child_process.fork()` "spawns a new Node.js process and invokes a specified module with an IPC communication channel", the nearest JavaScript counterpart of a separate process.

```python
import multiprocessing as mp

def square(n): return n * n

if __name__ == "__main__":
    with mp.Pool(4) as pool:
        print(pool.map(square, range(5)))
```

## Best practice

Write code that works under `spawn` (guard, picklable arguments, no reliance on inherited globals); prefer `concurrent.futures.ProcessPoolExecutor`; avoid `fork` in programs that already use threads.
