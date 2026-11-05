---
difficulty: easy
tags: [async]
source: https://docs.python.org/3.15/library/asyncio-dev.html
---

## Question

What does this print, and what is wrong with it?

```python
import asyncio

async def fetch():
    return 42

async def main():
    value = fetch()
    print(value)

asyncio.run(main())
```

## Answer

It prints a coroutine object such as `<coroutine object fetch at 0x...>`, not `42`, and Python emits a `RuntimeWarning` that the coroutine was never awaited. The call only created the coroutine; the fix is `value = await fetch()`.

## Explanation

When a coroutine function is called but not awaited, or not scheduled with `asyncio.create_task()`, asyncio emits a `RuntimeWarning` ("coroutine 'test' was never awaited"). Debug mode (`PYTHONASYNCIODEBUG=1`, the Python Development Mode, `asyncio.run(..., debug=True)` or `loop.set_debug()`) adds diagnostics such as logging callbacks that take longer than 100 milliseconds.

JS/TS comparison: MDN's promises guide also warns it "may be easy to forget the `await` keyword", which surfaces only as a type mismatch such as using a promise as a value; in JavaScript the promise still exists, in Python the coroutine has not run.

## Best practice

Run tests and CI with warnings turned into errors (`-W error`) so a missing `await` fails loudly, and enable asyncio debug mode in development.

```python
async def main():
    value = await fetch()    # runs the coroutine and returns 42
    print(value)
```
