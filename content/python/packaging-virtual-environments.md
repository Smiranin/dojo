---
difficulty: easy
tags: [packaging]
source: https://docs.python.org/3.15/library/venv.html
---

## Question

What is a virtual environment and why do you create one for every project?

## Answer

A virtual environment is an isolated directory with its own set of installed Python packages. It keeps one project's dependencies and versions from clashing with another's or with the system Python.

## Explanation

The tutorial says applications often use packages that don't come with the standard library, and a virtual environment is the solution; `venv` creates lightweight environments, each with their own independent set of packages. Create one with `python -m venv .venv`, activate it (`source .venv/bin/activate`; `.venv\Scripts\activate` on Windows) and install with pip. The docs describe it as not checked into source control and disposable. Version notes: since 3.12 `setuptools` is no longer a core venv dependency; since 3.13 `venv` creates a `.gitignore` for Git by default.

```sh
python -m venv .venv
source .venv/bin/activate
python -m pip install httpx
deactivate
```

## Best practice

One environment per project, outside version control and recreated from the declared dependencies; run `python -m pip` so pip binds to the active interpreter.
