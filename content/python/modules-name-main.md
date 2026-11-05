---
difficulty: easy
tags: [packaging]
source: https://docs.python.org/3.15/library/__main__.html
---

## Question

What does `if __name__ == "__main__":` do, and why do you see it everywhere?

## Answer

`__name__` is `"__main__"` when the file is run directly and the module's name when it is imported. The guard makes the code under it run only on direct execution, so importing the module has no side effects.

## Explanation

A module can discover whether it runs in the top-level code environment by checking its own `__name__`; code within the block won't run unless the module is executed in the top-level environment. The guard matters for libraries that are also scripts, for importing in tests and for `multiprocessing` with the spawn and forkserver start methods (see the multiprocessing Card). For an installed command, `[project.scripts]` declares a console script: a `spam-cli = "spam:main_cli"` entry makes a `spam-cli` command that calls `main_cli()`; PEP 621 says the table corresponds to the `console_scripts` entry point group.

```python
def main() -> None:
    print("running")

if __name__ == "__main__":
    main()
```

## Best practice

Keep top-level code minimal: logic in `main()` called under the guard, and expose installed tools through `[project.scripts]` in `pyproject.toml`.
