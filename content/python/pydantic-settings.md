---
difficulty: easy
tags: [pydantic]
source: https://pydantic.dev/docs/validation/latest/concepts/pydantic_settings/
---

## Question

How do you load configuration from environment variables in a Pydantic project?

## Answer

Install the separate `pydantic-settings` package and define a class that inherits from `BaseSettings`. It reads each field from the environment, and optionally from a `.env` file, and validates it like any model.

## Explanation

Pydantic Settings provides optional Pydantic features for loading a settings or config class from environment variables or secrets files; a model that inherits from `BaseSettings` reads values not passed as keyword arguments from the environment. In Pydantic v2 `BaseSettings` moved out of the main package into the separate package `pydantic-settings` (`pip install pydantic-settings`; PyPI shows 2.16.2, released Oct 28, 2026, for Python 3.11 and later). Environment variable names are case-insensitive by default; `SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')` adds a dotenv file and `env_prefix` a prefix.

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    database_url: str
    debug: bool = False

settings = Settings()   # DATABASE_URL and DEBUG come from the environment
```

## Best practice

Build the settings object once at start-up so a missing variable fails fast, and inject it where needed (for example as a FastAPI dependency). Keep `.env` files with secrets out of version control.
