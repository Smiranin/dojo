---
difficulty: medium
tags: [stdlib]
source: https://docs.python.org/3.15/library/datetime.html
---

## Question

What is the difference between naive and aware datetimes, and how should you get the current time in UTC today?

## Answer

A naive datetime has no time zone information and is ambiguous, while an aware one represents a specific moment in time. Use `datetime.now(UTC)`; `datetime.utcnow()` is deprecated since 3.12 because it returns a naive value.

## Explanation

The `datetime` docs (Python 3.15.2) say date and time objects are "aware" or "naive" depending on whether they include time zone information. A naive object does not contain enough information to unambiguously locate itself relative to other date/time objects, while an aware object "represents a specific moment in time that is not open to interpretation". `datetime.UTC` is an alias for `datetime.timezone.utc` (added in 3.11). `utcnow()` carries "Deprecated since version 3.12: Use datetime.now() with UTC instead", and the 3.15 notes list `utcnow()` and `utcfromtimestamp()` under pending removals with no removal version given.

```python
from datetime import datetime, UTC

created_at = datetime.now(UTC)          # aware, 3.11+ alias for timezone.utc
# datetime.utcnow()                      # deprecated since 3.12: naive result
print(created_at.isoformat())            # e.g. 2026-11-04T10:15:00.123456+00:00
```

## Best practice

Create aware datetimes with `datetime.now(UTC)`, replace `utcnow()` and `utcfromtimestamp()` in existing code, and do not mix naive and aware values.
