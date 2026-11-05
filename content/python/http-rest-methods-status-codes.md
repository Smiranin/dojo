---
difficulty: easy
tags: [http]
source: https://www.rfc-editor.org/rfc/rfc9110.html
---

## Question

What do GET, POST, PUT and DELETE mean in a REST API, and which of them are idempotent?

## Answer

GET reads a resource, POST makes the resource process the enclosed representation, PUT creates or replaces its state and DELETE removes it. GET, PUT and DELETE are idempotent and GET is also safe; POST is not.

## Explanation

RFC 9110 (HTTP Semantics, STD 97) calls methods "safe" if their semantics are essentially read-only (GET, HEAD, OPTIONS, TRACE) and "idempotent" if multiple identical requests have the same intended effect as a single one (PUT, DELETE and the safe methods). Idempotency matters for retries: a request can be repeated automatically if a communication failure occurs before the client reads the response, but "A client SHOULD NOT automatically retry a request with a non-idempotent method" unless it knows the request is idempotent, and "A proxy MUST NOT automatically retry non-idempotent requests".

Status codes follow the same RFC: return 200 for success, 201 for a created resource, 204 for success without content, 404 for a missing resource and 422 when the content cannot be processed. The 2xx class means the request was "successfully received, understood, and accepted"; 4xx means "the client seems to have erred"; 5xx means "the server is aware that it has erred or is incapable of performing the requested method". 201 means the request "has resulted in one or more new resources being created"; 204 means success with no additional content; 422 means the server understands the content type and syntax but "was unable to process the contained instructions".

Python's `http.HTTPStatus` names the codes. Since 3.13 it uses the RFC 9110 names, so 422 is `UNPROCESSABLE_CONTENT` (the old `UNPROCESSABLE_ENTITY` is kept for compatibility).

```python
from http import HTTPStatus

assert HTTPStatus.CREATED == 201
assert HTTPStatus.NOT_FOUND.phrase == "Not Found"
assert HTTPStatus.UNPROCESSABLE_CONTENT == 422   # 3.13+ name; 422 was UNPROCESSABLE_ENTITY
```

## Best practice

Use `HTTPStatus` names instead of bare numbers and choose the status by the RFC meaning (4xx client error, 5xx server fault). Do not auto-retry non-idempotent requests unless you can detect whether the first one was applied.
