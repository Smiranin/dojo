---
difficulty: easy
tags: [stdlib]
source: https://docs.python.org/3.15/library/pathlib.html
---

## Question

Why use `pathlib` instead of `os.path` and string concatenation for file paths?

## Answer

`pathlib.Path` models a path as an object: `/` joins segments, and methods such as `.read_text()`, `.glob()` and `.exists()` replace many `os` and `os.path` calls. It also handles Windows and POSIX differences.

## Explanation

The module offers classes representing filesystem paths with semantics appropriate for different operating systems, and the slash operator creates child paths like `os.path.join()`. `Path.read_text(encoding=None, ...)` opens, decodes and closes the file; `Path.glob()` yields matching files.

Version notes (Python 3.15.2 docs): `Path.walk()` was added in 3.12; `Path.copy()` in 3.14; `Path.mkdir()` gained `parent_mode` in 3.15; `glob()` gained `case_sensitive` in 3.12 and `recurse_symlinks` in 3.13. Since 3.15 UTF-8 is the default encoding of `open()` (PEP 686) instead of the platform-dependent locale encoding.

```python
from pathlib import Path

root = Path(__file__).parent
config = root / "config" / "app.toml"
if config.exists():
    text = config.read_text(encoding="utf-8")
for p in root.glob("**/*.py"):
    print(p.name)
```

## Best practice

Use `Path` throughout new code and pass an explicit `encoding="utf-8"` so behaviour is identical on every Python version.
