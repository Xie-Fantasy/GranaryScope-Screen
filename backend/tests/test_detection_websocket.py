"""Detection WebSocket and FastAPI lifespan tests."""

import time

from fastapi.testclient import TestClient

from liangcang_backend.core.config import Settings
from liangcang_backend.main import create_app
from liangcang_backend.schemas.detection import DetectionFrameMetadata


class FakeRuntime:
    def __init__(self, *_args) -> None:
        self.started = False
        self.stopped = False

    def start(self) -> None:
        self.started = True

    def stop(self) -> None:
        self.stopped = True


def test_lifespan_starts_and_stops_injected_runtime() -> None:
    app = create_app(
        Settings(APP_ENV="test", _env_file=None),
        runtime_factory=FakeRuntime,
    )
    runtime = app.state.detection_runtime

    with TestClient(app):
        assert runtime.started is True
        assert runtime.stopped is False

    assert runtime.stopped is True


def test_websocket_sends_camel_case_metadata_and_removes_client() -> None:
    app = create_app(Settings(APP_ENV="test", _env_file=None))
    broker = app.state.detection_broker
    metadata = DetectionFrameMetadata(
        camera_id="camera-01",
        frame_id=7,
        inference_started_at_ms=100,
        inference_finished_at_ms=110,
        source_width=1280,
        source_height=720,
        model_name="yolo11n.pt",
    )

    with TestClient(app) as client:
        with client.websocket_connect("/api/v1/ws/detections") as websocket:
            deadline = time.monotonic() + 1
            while broker.subscriber_count != 1 and time.monotonic() < deadline:
                time.sleep(0.005)
            assert broker.subscriber_count == 1

            broker.publish(metadata)
            payload = websocket.receive_json()

            assert payload["cameraId"] == "camera-01"
            assert payload["frameId"] == 7
            assert "camera_id" not in payload

        deadline = time.monotonic() + 1
        while broker.subscriber_count != 0 and time.monotonic() < deadline:
            time.sleep(0.005)
        assert broker.subscriber_count == 0
