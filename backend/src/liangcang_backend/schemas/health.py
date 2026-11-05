"""Health response contract."""

from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Minimal readiness-independent health response."""

    status: Literal["ok"]
    service: str
    version: str
    video_source_configured: bool
    inference_enabled: bool
    inference_phase: Literal[
        "disabled",
        "starting",
        "connecting",
        "running",
        "reconnecting",
        "error",
        "stopped",
    ]
    decoded_frames: int
    inferred_frames: int
