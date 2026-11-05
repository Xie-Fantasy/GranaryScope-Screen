"""Validated API and transport schemas."""

from liangcang_backend.schemas.detection import (
    Detection,
    DetectionFrameMetadata,
    NormalizedBoundingBox,
)

__all__ = ["Detection", "DetectionFrameMetadata", "NormalizedBoundingBox"]
