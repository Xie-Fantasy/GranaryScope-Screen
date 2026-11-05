"""Environment-backed application settings."""

from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import AnyHttpUrl, Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


BACKEND_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_INFERENCE_RTSP_URL = "rtsp://127.0.0.1:8554/camera1"
DEFAULT_ROBOT_MONITOR_BASE_URL = "http://127.0.0.1:8889/cam2/"
DEFAULT_ROBOT_CAPTURE_ROOT = Path("D:/LiangCang")
DEFAULT_CORS_ALLOW_ORIGIN_REGEX = (
    r"^https?://(?:localhost|127\.0\.0\.1|192\.168\.31\.\d{1,3})(?::\d+)?$"
)
DEFAULT_YOLO_MODEL_PATH = BACKEND_ROOT / "models" / "yolo11n.pt"


class RuntimeEnvironment(str, Enum):
    """Supported runtime profiles."""

    DEVELOPMENT = "development"
    TEST = "test"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """Settings loaded from process environment variables or a local .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
        populate_by_name=True,
    )

    app_name: str = Field(
        default="LiangCang Video Detection Backend",
        validation_alias="APP_NAME",
    )
    app_env: RuntimeEnvironment = Field(
        default=RuntimeEnvironment.DEVELOPMENT,
        validation_alias="APP_ENV",
    )
    app_host: str = Field(default="127.0.0.1", validation_alias="APP_HOST")
    app_port: int = Field(default=8000, ge=1, le=65535, validation_alias="APP_PORT")
    api_v1_prefix: str = Field(default="/api/v1", validation_alias="API_V1_PREFIX")
    inference_enabled: bool = Field(
        default=False,
        validation_alias="INFERENCE_ENABLED",
    )
    inference_rtsp_url: SecretStr = Field(
        default=SecretStr(DEFAULT_INFERENCE_RTSP_URL),
        validation_alias="INFERENCE_RTSP_URL",
    )
    # This is a LAN-B browser-playable robot-monitor address supplied by the
    # user. It is not RTSP, and callers must not append a WHEP suffix implicitly.
    robot_monitor_base_url: AnyHttpUrl = Field(
        default=DEFAULT_ROBOT_MONITOR_BASE_URL,
        validation_alias="ROBOT_MONITOR_BASE_URL",
    )
    robot_capture_root: Path = Field(
        default=DEFAULT_ROBOT_CAPTURE_ROOT,
        validation_alias="ROBOT_CAPTURE_ROOT",
    )
    cors_allow_origin_regex: str = Field(
        default=DEFAULT_CORS_ALLOW_ORIGIN_REGEX,
        validation_alias="CORS_ALLOW_ORIGIN_REGEX",
    )
    yolo_model_path: Path = Field(
        default=DEFAULT_YOLO_MODEL_PATH,
        validation_alias="YOLO_MODEL_PATH",
    )
    camera_id: str = Field(
        default="camera-01",
        min_length=1,
        validation_alias="CAMERA_ID",
    )
    inference_device: str = Field(
        default="cuda:0",
        min_length=1,
        validation_alias="INFERENCE_DEVICE",
    )
    inference_imgsz: int = Field(
        default=640,
        ge=32,
        le=4096,
        validation_alias="IMGSZ",
    )
    inference_conf: float = Field(
        default=0.25,
        ge=0.0,
        le=1.0,
        validation_alias="CONF",
    )
    # NoDecode keeps the raw env string so the validator below can parse
    # comma-separated ids; pydantic-settings would otherwise require JSON.
    inference_classes: Annotated[list[int] | None, NoDecode] = Field(
        default=None,
        validation_alias="CLASSES",
    )
    inference_target_fps: float = Field(
        default=10.0,
        gt=0.0,
        le=60.0,
        validation_alias="TARGET_FPS",
    )

    @field_validator("api_v1_prefix")
    @classmethod
    def validate_api_prefix(cls, value: str) -> str:
        """Normalize a non-root API prefix."""

        normalized = value.strip().rstrip("/")
        if not normalized.startswith("/") or normalized == "":
            raise ValueError("API_V1_PREFIX must be a non-root absolute path")
        return normalized

    @field_validator("inference_rtsp_url", mode="before")
    @classmethod
    def reject_empty_inference_url(cls, value: object) -> object:
        """Require a source while keeping its value wrapped as a secret."""

        if isinstance(value, str) and not value.strip():
            raise ValueError("INFERENCE_RTSP_URL must not be empty")
        return value

    @field_validator("inference_classes", mode="before")
    @classmethod
    def parse_class_filter(cls, value: object) -> object:
        """Accept comma-separated class ids (e.g. '0' or '0,2,5') from env files."""

        if value is None or value == "":
            return None
        if isinstance(value, str):
            parts = [part.strip() for part in value.split(",") if part.strip()]
            if not parts:
                return None
            try:
                return [int(part) for part in parts]
            except ValueError as exc:
                raise ValueError(
                    "CLASSES must be a comma-separated list of integer class ids"
                ) from exc
        return value

    @field_validator("camera_id", "inference_device")
    @classmethod
    def normalize_non_empty_text(cls, value: str) -> str:
        """Strip identifiers and reject whitespace-only values."""

        normalized = value.strip()
        if not normalized:
            raise ValueError("value must not be empty")
        return normalized

    @property
    def video_source_configured(self) -> bool:
        """Return configuration state without exposing the source value."""

        return bool(self.inference_rtsp_url.get_secret_value().strip())


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Load settings once for the process."""

    return Settings()
