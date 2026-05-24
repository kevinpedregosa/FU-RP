"""Application configuration for the FastAPI backend."""

from pathlib import Path
from typing import Any, List

from pydantic_settings import (
    BaseSettings,
    DotEnvSettingsSource,
    EnvSettingsSource,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
)


def _parse_origins(value: Any) -> Any:
    if isinstance(value, str) and value and not value.strip().startswith("["):
        return [origin.strip() for origin in value.split(",") if origin.strip()]
    return value


class _EnvSettingsSource(EnvSettingsSource):
    def prepare_field_value(
        self, field_name: str, field: Any, value: Any, value_is_complex: bool
    ) -> Any:
        if field_name == "ALLOWED_ORIGINS":
            return _parse_origins(value)
        return super().prepare_field_value(field_name, field, value, value_is_complex)


class _DotEnvSettingsSource(DotEnvSettingsSource):
    def prepare_field_value(
        self, field_name: str, field: Any, value: Any, value_is_complex: bool
    ) -> Any:
        if field_name == "ALLOWED_ORIGINS":
            return _parse_origins(value)
        return super().prepare_field_value(field_name, field, value, value_is_complex)


class Settings(BaseSettings):
    """Runtime settings loaded from environment variables and .env."""

    DATABASE_URL: str = "sqlite+aiosqlite:///./duckweed.db"
    STORAGE_DIR: Path = Path("./storage")
    MODELS_DIR: Path = Path("./models/weights")
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    YOLO_MODEL_PATH: Path = Path("./models/weights/duckweed_v1.pt")
    YOLO_FALLBACK_PATH: Path = Path("./models/weights/yolov8n-seg.pt")
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    @property
    def is_production(self) -> bool:
        """Return True when the app is running in production."""
        return self.ENVIRONMENT == "production"

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        """Allow ALLOWED_ORIGINS as JSON or a comma-separated .env value."""
        return (
            init_settings,
            _EnvSettingsSource(settings_cls),
            _DotEnvSettingsSource(settings_cls),
            file_secret_settings,
        )

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


settings = Settings()
