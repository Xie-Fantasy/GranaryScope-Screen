"""Environment configuration tests."""

from pathlib import Path

import pytest
from pydantic import ValidationError

from liangcang_backend.core.config import RuntimeEnvironment, Settings


def test_settings_load_environment_values(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("APP_PORT", "9100")
    monkeypatch.setenv("API_V1_PREFIX", "/internal/v1/")
    monkeypatch.setenv(
        "INFERENCE_RTSP_URL",
        "rtsp://placeholder-user:placeholder-password@camera.example.local/live",
    )
    monkeypatch.setenv("ROBOT_MONITOR_BASE_URL", "http://robot.example.local/cam2/")
    monkeypatch.setenv("INFERENCE_ENABLED", "true")
    monkeypatch.setenv("CAMERA_ID", " camera-warehouse ")
    monkeypatch.setenv("INFERENCE_DEVICE", "cpu")
    monkeypatch.setenv("IMGSZ", "960")
    monkeypatch.setenv("CONF", "0.4")
    monkeypatch.setenv("TARGET_FPS", "8")

    settings = Settings(_env_file=None)

    assert settings.app_env is RuntimeEnvironment.TEST
    assert settings.app_port == 9100
    assert settings.api_v1_prefix == "/internal/v1"
    assert settings.inference_enabled is True
    assert settings.camera_id == "camera-warehouse"
    assert settings.inference_device == "cpu"
    assert settings.inference_imgsz == 960
    assert settings.inference_conf == 0.4
    assert settings.inference_target_fps == 8
    assert str(settings.robot_monitor_base_url) == "http://robot.example.local/cam2/"
    assert settings.video_source_configured is True
    assert "placeholder-password" not in repr(settings)


def test_default_inference_is_disabled_with_safe_local_source() -> None:
    settings = Settings(_env_file=None)

    assert settings.inference_enabled is False
    assert settings.inference_rtsp_url.get_secret_value() == (
        "rtsp://127.0.0.1:8554/camera1"
    )
    assert str(settings.robot_monitor_base_url) == "http://127.0.0.1:8889/cam2/"
    assert settings.yolo_model_path.name == "yolo11n.pt"
    assert settings.yolo_model_path == (
        Path(__file__).resolve().parents[1] / "models" / "yolo11n.pt"
    )
    assert settings.video_source_configured is True


def test_empty_inference_url_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("INFERENCE_RTSP_URL", "   ")

    with pytest.raises(ValidationError, match="INFERENCE_RTSP_URL"):
        Settings(_env_file=None)


def test_api_prefix_must_be_absolute() -> None:
    with pytest.raises(ValidationError):
        Settings(API_V1_PREFIX="api/v1", _env_file=None)


@pytest.mark.parametrize(
    ("name", "value"),
    [
        ("IMGSZ", "0"),
        ("CONF", "1.1"),
        ("TARGET_FPS", "0"),
        ("CAMERA_ID", "   "),
    ],
)
def test_inference_settings_reject_invalid_values(
    name: str,
    value: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv(name, value)

    with pytest.raises(ValidationError):
        Settings(_env_file=None)
