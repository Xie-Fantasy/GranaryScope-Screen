"""Detection metadata contract tests."""

import pytest
from pydantic import ValidationError

from liangcang_backend.schemas.detection import DetectionFrameMetadata


def valid_payload() -> dict[str, object]:
    return {
        "cameraId": "camera-01",
        "frameId": 91_283,
        "capturedAtMs": 1_788_401_105_123,
        "sourceTimestamp": 123.456,
        "inferenceStartedAtMs": 1_788_401_105_130,
        "inferenceFinishedAtMs": 1_788_401_105_142,
        "sourceWidth": 2_560,
        "sourceHeight": 1_440,
        "modelName": "yolo11n.pt",
        "detections": [
            {
                "classId": 0,
                "label": "person",
                "confidence": 0.94,
                "bboxNorm": {"x": 0.164, "y": 0.15, "w": 0.112, "h": 0.51},
            }
        ],
    }


def test_metadata_validates_and_serializes_camel_case_contract() -> None:
    metadata = DetectionFrameMetadata.model_validate(valid_payload())

    serialized = metadata.model_dump(by_alias=True)

    assert serialized["cameraId"] == "camera-01"
    assert serialized["frameId"] == 91_283
    assert serialized["sourceWidth"] == 2_560
    assert serialized["modelName"] == "yolo11n.pt"
    assert serialized["detections"][0]["bboxNorm"] == {
        "x": 0.164,
        "y": 0.15,
        "w": 0.112,
        "h": 0.51,
    }
    assert "camera_id" not in serialized


@pytest.mark.parametrize(
    ("path", "value"),
    [
        (("frameId",), -1),
        (("sourceWidth",), 0),
        (("sourceHeight",), 0),
        (("detections", 0, "confidence"), 1.01),
        (("detections", 0, "confidence"), float("nan")),
        (("detections", 0, "bboxNorm", "x"), -0.01),
        (("detections", 0, "bboxNorm", "w"), float("inf")),
    ],
)
def test_metadata_rejects_invalid_numeric_values(
    path: tuple[str | int, ...], value: object
) -> None:
    payload = valid_payload()
    target: object = payload
    for key in path[:-1]:
        target = target[key]  # type: ignore[index]
    target[path[-1]] = value  # type: ignore[index]

    with pytest.raises(ValidationError):
        DetectionFrameMetadata.model_validate(payload)


@pytest.mark.parametrize(
    ("x", "y", "w", "h"),
    [
        (0.9, 0.1, 0.2, 0.2),
        (0.1, 0.8, 0.2, 0.3),
    ],
)
def test_metadata_rejects_boxes_outside_source_frame(
    x: float, y: float, w: float, h: float
) -> None:
    payload = valid_payload()
    payload["detections"][0]["bboxNorm"] = {  # type: ignore[index]
        "x": x,
        "y": y,
        "w": w,
        "h": h,
    }

    with pytest.raises(ValidationError, match="must not exceed"):
        DetectionFrameMetadata.model_validate(payload)


def test_metadata_rejects_reverse_inference_timestamps() -> None:
    payload = valid_payload()
    payload["inferenceFinishedAtMs"] = 1

    with pytest.raises(ValidationError, match="inferenceFinishedAtMs"):
        DetectionFrameMetadata.model_validate(payload)


def test_metadata_rejects_unknown_fields_and_credential_shaped_data() -> None:
    payload = valid_payload()
    payload["cameraRtspUrl"] = "credential-bearing-value-is-not-part-of-contract"

    with pytest.raises(ValidationError, match="Extra inputs are not permitted"):
        DetectionFrameMetadata.model_validate(payload)


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("cameraId", "   "),
        ("modelName", ""),
        ("frameId", "91283"),
    ],
)
def test_metadata_rejects_empty_identifiers_and_type_coercion(
    field: str, value: object
) -> None:
    payload = valid_payload()
    payload[field] = value

    with pytest.raises(ValidationError):
        DetectionFrameMetadata.model_validate(payload)
