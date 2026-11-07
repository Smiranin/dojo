---
difficulty: hard
tags: [fastapi, http, async]
source: https://fastapi.tiangolo.com/deployment/server-workers/
---

## Question

How do you run a FastAPI app in production: which server, how many workers, and what changes under Kubernetes?

## Answer

FastAPI is an ASGI app, so you run it with an ASGI server, Uvicorn, usually through `fastapi run` (production mode) rather than `fastapi dev`. On one machine you add worker processes with `--workers`; under Kubernetes you normally run a single Uvicorn process per container and scale by running more containers.

## Explanation

`fastapi dev` is development mode: auto-reload is enabled and it listens on `127.0.0.1`. `fastapi run` is production mode: auto-reload is disabled and it listens on `0.0.0.0`; internally the FastAPI CLI uses Uvicorn. `--workers N` starts N worker processes under a parent process that acts as the process manager, as in `fastapi run --workers 4 main.py`. Replication, the number of processes running, is one of the deployment concepts. On Kubernetes the docs say you will probably not want workers and instead a single Uvicorn process per container, with replication by running multiple containers.

Gunicorn: the FastAPI docs say the official Docker image built on Gunicorn with Uvicorn is deprecated, that Gunicorn was needed "just to have Gunicorn manage and restart the Uvicorn worker processes", and their Dockerfile now uses `fastapi run` with `--workers`. Uvicorn's own page says it "includes a `--workers` option", that its `uvicorn.workers` module is deprecated in favour of the separate `uvicorn-worker` package, and that `--reload` and `--workers` are mutually exclusive. These pages show no version of their own; they are tied to the 0.136+ line through FastAPI's dated release notes (0.136.0 on 2026-04-16, 0.162.0 on 2026-10-23).

```sh
fastapi dev main.py                  # local: reload, 127.0.0.1
fastapi run --workers 4 main.py      # one box: 4 worker processes
uv run uvicorn main:app --host 0.0.0.0 --port 8080 --workers 4
```

## Best practice

Containerise one process per container and scale horizontally in an orchestrator; elsewhere use `--workers` or an external process manager. Each worker has its own database connection pool, so size pools against the number of workers (see the SQLAlchemy session Card).
