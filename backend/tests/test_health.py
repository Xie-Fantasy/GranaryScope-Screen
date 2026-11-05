"""Health endpoint tests."""

from fastapi.testclient import TestClient

from liangcang_backend.main import create_app
from liangcang_backend.core.config import Settings


def test_health_starts_without_ai_dependencies() -> None:
    settings = Settings(APP_ENV="test", INFERENCE_ENABLED=False, _env_file=None)
    client = TestClient(create_app(settings))

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "LiangCang Video Detection Backend",
        "version": "0.1.0",
        "video_source_configured": True,
        "inference_enabled": False,
        "inference_phase": "disabled",
        "decoded_frames": 0,
        "inferred_frames": 0,
    }


def test_health_reports_configuration_without_exposing_source() -> None:
    source = "rtsp://placeholder-user:placeholder-password@camera.example.local/live"
    settings = Settings(APP_ENV="test", INFERENCE_RTSP_URL=source, _env_file=None)
    client = TestClient(create_app(settings))

    response = client.get("/api/v1/health")
    serialized_response = response.text

    assert response.status_code == 200
    assert response.json()["video_source_configured"] is True
    assert "placeholder-user" not in serialized_response
    assert "placeholder-password" not in serialized_response
    assert "camera.example.local" not in serialized_response
