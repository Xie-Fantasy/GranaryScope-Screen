"""Offline tests for runtime lifecycle and Ultralytics result conversion."""

from pathlib import Path
from types import SimpleNamespace

from liangcang_backend.core.config import Settings
from liangcang_backend.core.detection_broker import LatestDetectionBroker
from liangcang_backend.inference import runtime as runtime_module
from liangcang_backend.inference.runtime import (
    DecodedFrame,
    DetectionRuntime,
    RuntimePhase,
    detection_metadata_from_result,
)


class FakeTensor:
    def __init__(self, value: object) -> None:
        self._value = value

    def detach(self) -> "FakeTensor":
        return self

    def cpu(self) -> "FakeTensor":
        return self

    def tolist(self) -> object:
        return self._value


class FakeImage:
    shape = (100, 200, 3)


def test_disabled_runtime_never_imports_optional_ai(monkeypatch) -> None:
    def fail_import(*_args, **_kwargs):
        raise AssertionError("optional AI dependency was imported")

    monkeypatch.setattr(runtime_module, "_import_av", fail_import)
    monkeypatch.setattr(runtime_module, "_load_yolo_model", fail_import)
    runtime = DetectionRuntime(
        Settings(APP_ENV="test", INFERENCE_ENABLED=False, _env_file=None),
        LatestDetectionBroker(),
    )

    runtime.start()
    snapshot = runtime.snapshot()
    runtime.stop()

    assert snapshot.enabled is False
    assert snapshot.phase is RuntimePhase.DISABLED
    assert snapshot.decoded_frames == 0
    assert snapshot.inferred_frames == 0


def test_ultralytics_result_converts_to_normalized_contract() -> None:
    boxes = SimpleNamespace(
        xyxy=FakeTensor([[-10.0, 20.0, 220.0, 80.0]]),
        conf=FakeTensor([0.8]),
        cls=FakeTensor([0.0]),
        id=FakeTensor([1.0]),
    )
    result = SimpleNamespace(boxes=boxes, names={0: "person"})
    frame = DecodedFrame(
        image=FakeImage(),  # type: ignore[arg-type]
        frame_id=42,
        captured_at_ms=900,
        source_timestamp=1.5,
    )

    metadata = detection_metadata_from_result(
        result=result,
        frame=frame,
        camera_id="camera-01",
        model_path=Path("D:/models/yolo11n.pt"),
        inference_started_at_ms=910,
        inference_finished_at_ms=920,
    )
    payload = metadata.model_dump(by_alias=True)

    assert payload["frameId"] == 42
    assert payload["sourceWidth"] == 200
    assert payload["sourceHeight"] == 100
    assert payload["modelName"] == "yolo11n.pt"
    assert payload["detections"] == [
        {
            "classId": 0,
            "label": "person",
            "confidence": 0.8,
            "bboxNorm": {"x": 0.0, "y": 0.2, "w": 1.0, "h": 0.6},
            "trackId": 1,
        }
    ]


def test_result_without_track_ids_maps_to_none() -> None:
    boxes = SimpleNamespace(
        xyxy=FakeTensor([[0.0, 0.0, 100.0, 100.0]]),
        conf=FakeTensor([0.9]),
        cls=FakeTensor([0.0]),
        id=None,
    )
    result = SimpleNamespace(boxes=boxes, names={0: "person"})
    frame = DecodedFrame(
        image=FakeImage(),  # type: ignore[arg-type]
        frame_id=7,
        captured_at_ms=900,
        source_timestamp=None,
    )

    metadata = detection_metadata_from_result(
        result=result,
        frame=frame,
        camera_id="camera-01",
        model_path=Path("D:/models/yolo11n.pt"),
        inference_started_at_ms=910,
        inference_finished_at_ms=920,
    )

    assert metadata.detections[0].track_id is None


def _frame_metadata_with_track(
    runtime: DetectionRuntime,
    *,
    frame_id: int,
    track_id: int | None,
) -> object:
    boxes = SimpleNamespace(
        xyxy=FakeTensor([[0.0, 0.0, 100.0, 100.0]]),
        conf=FakeTensor([0.9]),
        cls=FakeTensor([0.0]),
        id=FakeTensor([float(track_id)]) if track_id is not None else None,
    )
    result = SimpleNamespace(boxes=boxes, names={0: "person"})
    return detection_metadata_from_result(
        result=result,
        frame=DecodedFrame(
            image=FakeImage(),  # type: ignore[arg-type]
            frame_id=frame_id,
            captured_at_ms=0,
            source_timestamp=None,
        ),
        camera_id="camera-01",
        model_path=Path("D:/models/yolo11n.pt"),
        inference_started_at_ms=0,
        inference_finished_at_ms=1,
    )


def test_transient_tracks_are_suppressed_until_stable() -> None:
    runtime = DetectionRuntime(
        Settings(APP_ENV="test", INFERENCE_ENABLED=True, _env_file=None),
        LatestDetectionBroker(),
    )

    # 前两帧：track 1 出现但未达阈值，被抑制；无 track id 的框直接丢弃。
    first = runtime._filter_transient_tracks(
        _frame_metadata_with_track(runtime, frame_id=1, track_id=1)  # type: ignore[arg-type]
    )
    assert first.detections == []

    second = runtime._filter_transient_tracks(
        _frame_metadata_with_track(runtime, frame_id=2, track_id=1)  # type: ignore[arg-type]
    )
    assert second.detections == []

    # 第三帧：达到 _MIN_TRACK_HITS，开始发布。
    third = runtime._filter_transient_tracks(
        _frame_metadata_with_track(runtime, frame_id=3, track_id=1)  # type: ignore[arg-type]
    )
    assert [d.track_id for d in third.detections] == [1]

    # 无 track id 的单帧框永远不发布。
    untracked = runtime._filter_transient_tracks(
        _frame_metadata_with_track(runtime, frame_id=4, track_id=None)  # type: ignore[arg-type]
    )
    assert untracked.detections == []


def test_track_state_is_pruned_after_long_absence() -> None:
    runtime = DetectionRuntime(
        Settings(APP_ENV="test", INFERENCE_ENABLED=True, _env_file=None),
        LatestDetectionBroker(),
    )

    runtime._filter_transient_tracks(
        _frame_metadata_with_track(runtime, frame_id=1, track_id=5)  # type: ignore[arg-type]
    )
    # 远超 miss 上限后重现：计数状态已被清除，需重新累计命中。
    runtime._filter_transient_tracks(
        _frame_metadata_with_track(runtime, frame_id=1000, track_id=5)  # type: ignore[arg-type]
    )
    assert runtime._track_states == {5: (1, 1000)}
