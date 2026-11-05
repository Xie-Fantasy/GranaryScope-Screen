"""Validated, transport-neutral detection metadata models."""

import math
from typing import Annotated

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    model_validator,
)
from pydantic.alias_generators import to_camel

NonEmptyText = Annotated[
    str,
    StringConstraints(strict=True, strip_whitespace=True, min_length=1),
]
UnitFloat = Annotated[float, Field(strict=True, ge=0.0, le=1.0)]
NonNegativeInt = Annotated[int, Field(strict=True, ge=0)]
PositiveInt = Annotated[int, Field(strict=True, gt=0)]


class DetectionSchema(BaseModel):
    """Shared strict configuration for detection metadata payloads."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        extra="forbid",
        frozen=True,
        populate_by_name=True,
    )


class NormalizedBoundingBox(DetectionSchema):
    """Top-left-based bounding box normalized against source dimensions."""

    x: UnitFloat
    y: UnitFloat
    w: UnitFloat
    h: UnitFloat

    @model_validator(mode="after")
    def validate_extent(self) -> "NormalizedBoundingBox":
        """Reject boxes that extend beyond the normalized source frame."""

        if not all(math.isfinite(value) for value in (self.x, self.y, self.w, self.h)):
            raise ValueError("bboxNorm values must be finite")
        if self.x + self.w > 1.0:
            raise ValueError("bboxNorm x + w must not exceed 1")
        if self.y + self.h > 1.0:
            raise ValueError("bboxNorm y + h must not exceed 1")
        return self


class Detection(DetectionSchema):
    """One model detection without any unconfirmed business-category rules."""

    class_id: NonNegativeInt
    label: NonEmptyText
    confidence: UnitFloat
    bbox_norm: NormalizedBoundingBox
    # Tracker-assigned identity; None when the runtime runs without tracking
    # or a box could not be associated with an existing track.
    track_id: NonNegativeInt | None = None

    @model_validator(mode="after")
    def validate_confidence(self) -> "Detection":
        """Reject non-finite confidence values explicitly."""

        if not math.isfinite(self.confidence):
            raise ValueError("confidence must be finite")
        return self


class DetectionFrameMetadata(DetectionSchema):
    """Normalized metadata for one inferred source frame.

    ``capturedAtMs`` is optional because a wall-clock capture time is not
    guaranteed by every decoder. ``sourceTimestamp`` is likewise optional and
    represents the decoder-provided source timeline when available.
    """

    camera_id: NonEmptyText
    frame_id: NonNegativeInt
    captured_at_ms: NonNegativeInt | None = None
    source_timestamp: Annotated[float, Field(strict=True, ge=0.0)] | None = None
    inference_started_at_ms: NonNegativeInt
    inference_finished_at_ms: NonNegativeInt
    source_width: PositiveInt
    source_height: PositiveInt
    model_name: NonEmptyText
    detections: list[Detection] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_timestamps(self) -> "DetectionFrameMetadata":
        """Ensure inference completion does not precede its start."""

        if self.source_timestamp is not None and not math.isfinite(
            self.source_timestamp
        ):
            raise ValueError("sourceTimestamp must be finite")
        if self.inference_finished_at_ms < self.inference_started_at_ms:
            raise ValueError(
                "inferenceFinishedAtMs must be greater than or equal to "
                "inferenceStartedAtMs"
            )
        return self
