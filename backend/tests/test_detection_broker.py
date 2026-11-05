"""Latest-only detection broker tests."""

import asyncio

from liangcang_backend.core.detection_broker import LatestDetectionBroker
from liangcang_backend.schemas.detection import DetectionFrameMetadata


def metadata(frame_id: int) -> DetectionFrameMetadata:
    return DetectionFrameMetadata(
        camera_id="camera-01",
        frame_id=frame_id,
        inference_started_at_ms=100,
        inference_finished_at_ms=101,
        source_width=1920,
        source_height=1080,
        model_name="yolo11n.pt",
    )


def test_slow_subscriber_receives_only_latest_metadata() -> None:
    async def scenario() -> None:
        broker = LatestDetectionBroker()
        subscription = broker.subscribe()

        broker.publish(metadata(1))
        broker.publish(metadata(2))
        broker.publish(metadata(3))
        await asyncio.sleep(0)

        assert (await subscription.receive()).frame_id == 3
        assert broker.peek() is not None
        assert broker.peek().frame_id == 3  # type: ignore[union-attr]
        subscription.close()
        subscription.close()
        assert broker.subscriber_count == 0

    asyncio.run(scenario())


def test_broker_rejects_unvalidated_payload() -> None:
    broker = LatestDetectionBroker()

    try:
        broker.publish({"frameId": 1})  # type: ignore[arg-type]
    except TypeError as exc:
        assert "DetectionFrameMetadata" in str(exc)
    else:
        raise AssertionError("unvalidated payload was accepted")
