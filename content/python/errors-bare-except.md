---
difficulty: easy
tags: [errors]
source: https://docs.python.org/3.15/tutorial/errors.html
---

## Question

Why is `except:` or `except Exception: pass` considered bad, and what should you catch instead?

## Answer

It hides real bugs: a wide handler swallows errors you did not expect and the program carries on in a broken state. Catch the specific exceptions you can handle and let anything else propagate, or log it and re-raise.

## Explanation

The tutorial calls it good practice to be as specific as possible with the exception types you intend to handle and to allow unexpected ones to propagate. `Exception` is the base of all built-in, non-system-exiting exceptions; `KeyboardInterrupt` and `SystemExit` inherit from `BaseException` so that they are not accidentally caught by code that catches `Exception`, which means a bare `except:` would also swallow Ctrl-C and `sys.exit()`. When converting an error, chain it with `raise ... from exc` (marks the direct cause; `from None` disables chaining). Python 3.14 (PEP 758) lets you list several types without parentheses when there is no `as` clause.

```python
try:
    price = fetch_price(sku)
except TimeoutError, ConnectionRefusedError:      # 3.14+: no parentheses without `as`
    price = cached_price(sku)
except (ValueError, KeyError) as exc:             # parentheses still required with `as`
    raise PricingError(f"bad data for {sku}") from exc
```

## Best practice

Catch narrow types close to the failing call; never `pass` silently; log with context or re-raise. Keep the parenthesised form in code that must run before 3.14.
