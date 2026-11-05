"""Service health endpoint."""

from typing import cast

from fastapi import APIRouter, Request

from liangcang_backend import __version__
from liangcang_backend.core.config import Settings
from liangcang_backend.inference.runtime import DetectionRuntime
from liangcang_backend.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def get_health(request: Request) -> HealthResponse:
    """Report API availability without probing RTSP, GPU, or a model."""

    settings = cast(Settings, request.app.state.settings)
    runtime = cast(DetectionRuntime, request.app.state.detection_runtime)
    inference = runtime.snapshot()
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=__version__,
        video_source_configured=settings.video_source_configured,
        inference_enabled=inference.enabled,
        inference_phase=inference.phase.value,
        decoded_frames=inference.decoded_frames,
        inferred_frames=inference.inferred_frames,
    )
