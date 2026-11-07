---
difficulty: easy
tags: [stdlib]
source: https://docs.python.org/3.15/howto/logging.html
---

## Question

Why use the `logging` module instead of `print` in a backend service, and how do log levels work?

## Answer

`print` is for ordinary console output of a command-line program; a service reports events through loggers, which have severity levels. The default level is WARNING, so `info` and `debug` messages appear only after you configure a lower level.

## Explanation

The Logging HOWTO (Python 3.15.2) has a table that sends console output of a command-line script to `print()`, events during normal operation to a logger's `info()` (or `debug()`), a warning with nothing the client can do to `warning()`, and error suppression in a long-running server process to `error()`, `exception()` or `critical()`. `exception()` should be called only from an exception handler. Name loggers with the module-level convention `logger = logging.getLogger(__name__)`. To log variable data, use a format string and append the variable data as arguments.

```python
import logging

logger = logging.getLogger(__name__)

def charge(order_id: int) -> None:
    try:
        gateway.charge(order_id)
    except TimeoutError:
        logger.exception("charge failed for order %s", order_id)
        raise
# handlers and levels are configured once at application start-up (see the HOWTO)
```

## Best practice

Use one module-level logger named with `__name__`, pass variables as arguments to the format string, and call `logger.exception()` inside `except` blocks when you log a failure you handle.
