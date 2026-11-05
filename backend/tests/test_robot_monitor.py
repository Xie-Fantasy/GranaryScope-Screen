"""Robot-monitor source and screenshot persistence tests."""

from pathlib import Path
from urllib.parse import urlparse

from fastapi.testclient import TestClient

from liangcang_backend.core.config import Settings
from liangcang_backend.main import create_app


JPEG_BYTES = b"\xff\xd8\xff\xe0LiangCang robot capture\xff\xd9"


def create_client(capture_root: Path) -> TestClient:
    settings = Settings(
        APP_ENV="test",
        INFERENCE_ENABLED=False,
        ROBOT_CAPTURE_ROOT=capture_root,
        _env_file=None,
    )
    return TestClient(create_app(settings))


def test_robot_monitor_source_returns_configured_browser_url(tmp_path: Path) -> None:
    client = create_client(tmp_path)

    response = client.get("/api/v1/video-sources/robot-monitor")

    assert response.status_code == 200
    assert response.json() == {"streamUrl": "http://127.0.0.1:8889/cam2/"}


def test_robot_capture_is_date_partitioned_and_can_be_rendered(tmp_path: Path) -> None:
    client = create_client(tmp_path)

    response = client.post(
        "/api/v1/robot-captures/1",
        content=JPEG_BYTES,
        headers={"Content-Type": "image/jpeg"},
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["capturedAt"]
    image_path = urlparse(payload["imageUrl"]).path
    saved_file = tmp_path.joinpath(*image_path.split("/robot-captures/", maxsplit=1)[1].split("/"))
    assert saved_file.is_file()
    assert saved_file.read_bytes() == JPEG_BYTES

    rendered = client.get(image_path)
    assert rendered.status_code == 200
    assert rendered.headers["content-type"] == "image/jpeg"
    assert rendered.content == JPEG_BYTES


def test_robot_capture_rejects_unsupported_alert_and_invalid_content(tmp_path: Path) -> None:
    client = create_client(tmp_path)

    assert client.post(
        "/api/v1/robot-captures/2",
        content=JPEG_BYTES,
        headers={"Content-Type": "image/jpeg"},
    ).status_code == 404
    assert client.post(
        "/api/v1/robot-captures/1",
        content=b"not an image",
        headers={"Content-Type": "image/jpeg"},
    ).status_code == 422
