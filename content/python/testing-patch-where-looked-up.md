---
difficulty: medium
tags: [testing]
source: https://docs.python.org/3.15/library/unittest.mock.html
---

## Question

How do you replace a dependency in a test, such as an HTTP call or an environment variable, and where must you patch it?

## Answer

Use `monkeypatch` (or `unittest.mock.patch`) to swap the attribute for the duration of the test. Patch the name where the code under test looks it up, not where it was defined.

## Explanation

pytest's `monkeypatch` fixture safely sets or deletes an attribute, dictionary item or environment variable, and all modifications are undone after the requesting test or fixture has finished. The `unittest.mock` docs (Python 3.15.2) state: "The basic principle is that you patch where an object is looked up, which is not necessarily the same place as where it is defined". If `service.py` does `from client import fetch`, the code calls `service.fetch`, so patch `service.fetch`. Autospeccing limits a mock to the API of the original object and gives mocked functions the same call signature, so they raise `TypeError` if called incorrectly.

```python
# service.py:  from client import fetch
#              def price(sku): return fetch(sku)["price"]

def test_price(monkeypatch):
    monkeypatch.setattr("service.fetch", lambda sku: {"price": 10})
    assert price("abc") == 10

def test_env(monkeypatch):
    monkeypatch.setenv("API_URL", "http://test")
```

## Best practice

Prefer injecting dependencies (pass the client in, or override a FastAPI dependency) over patching. When you patch, use `autospec=True` and patch the lookup site.
