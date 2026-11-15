import json
from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
_WEIGHTS = Path(__file__).resolve().parent / "engine" / "weights.json"


def _version_kernel() -> str:
    try:
        return str(json.loads(_WEIGHTS.read_text(encoding="utf-8"))["version"])
    except (OSError, KeyError, ValueError):
        return "0.0.0"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    dataset_dir: Path = BASE_DIR.parent / "dataset_clean"
    db_url: str = f"sqlite:///{(BASE_DIR / 'emberwatch.db').as_posix()}"
    kernel_version: str = _version_kernel()
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173"

    @field_validator("dataset_dir", mode="after")
    @classmethod
    def _absolutize(cls, value: Path) -> Path:
        return value if value.is_absolute() else (BASE_DIR / value).resolve()

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def settings() -> Settings:
    return Settings()
