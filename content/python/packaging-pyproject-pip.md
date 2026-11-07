---
difficulty: medium
tags: [packaging]
source: https://peps.python.org/pep-0621/
---

## Question

What goes into `pyproject.toml`, and how do you install a project and its dependencies with pip?

## Answer

`pyproject.toml` holds `[build-system]` (which build backend builds the package) and the `[project]` table with the name, version, `requires-python` and dependencies. You install with `pip install .`, or `pip install -e .` for an editable install while developing.

## Explanation

PEP 621 specifies how to write a project's core metadata in `pyproject.toml`, in a table named `[project]`; the PyPA spec says `name` is the only key that must be statically defined and `version` may be static or dynamic. `[build-system]` declares the Python-level dependencies needed to run the build. pip documentation v26.3 describes `-e, --editable` as installing a project in editable mode from a local project path, and the local directory must contain a `pyproject.toml` or `setup.py`. Dev-only dependencies belong in `[dependency-groups]` (PEP 735, Final, resolved 10-Oct-2024), which are not included in the built distribution; PEP 751 (Final, resolved 31-Mar-2025) defines the `pylock.toml` lock file format for reproducible installation.

```toml
[build-system]
requires = ["<your build backend package>"]
build-backend = "<your build backend>"

[project]
name = "orders-api"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["fastapi>=0.136", "sqlalchemy>=2.0"]

[dependency-groups]
dev = ["pytest"]
```

## Best practice

Declare dependencies in `pyproject.toml` with lower bounds, use a lock file for deployments and CI, and install into a virtual environment.
