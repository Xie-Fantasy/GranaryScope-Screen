"""Robot-monitor source discovery and alert snapshot storage."""

from datetime import datetime
from pathlib import Path
from typing import Final, cast
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, Response, status
from fastapi.responses import FileResponse

from liangcang_backend.core.config import Settings
from liangcang_backend.schemas.robot_capture import (
    RobotCaptureResponse,
    RobotMonitorSourceResponse,
)

router = APIRouter(tags=["robot-monitor"])

ALLOWED_CAPTURE_ALERT_KEYS: Final = frozenset({"1", "4"})
MAX_CAPTURE_BYTES: Final = 12 * 1024 * 1024


def is_valid_jpeg(payload: bytes) -> bool:
    """Perform lightweight JPEG framing validation without optional image libs."""

    return len(payload) >= 4 and payload.startswith(b"\xff\xd8\xff") and payload.endswith(b"\xff\xd9")


def resolve_capture_file(
    root: Path,
    year: str,
    month: str,
    day: str,
    filename: str,
) -> Path | None:
    """Resolve a date-partitioned JPG while rejecting traversal and malformed paths."""

    if (
        not (len(year) == 4 and year.isdecimal())
        or not (len(month) == 2 and month.isdecimal())
        or not (len(day) == 2 and day.isdecimal())
        or not filename.endswith(".jpg")
        or len(filename) != 43
        or not filename[:6].isdecimal()
        or filename[6] != "-"
        or any(character not in "0123456789abcdef" for character in filename[7:-4])
    ):
        return None

    candidate = root / year / month / day / filename
    try:
        candidate.resolve().relative_to(root.resolve())
    except ValueError:
        return None
    return candidate


@router.get("/video-sources/robot-monitor", response_model=RobotMonitorSourceResponse)
async def get_robot_monitor_source(request: Request) -> RobotMonitorSourceResponse:
    """Return the configured credential-free browser-playable robot source."""

    settings = cast(Settings, request.app.state.settings)
    return RobotMonitorSourceResponse(stream_url=str(settings.robot_monitor_base_url))


@router.post(
    "/robot-captures/{alert_key}",
    response_model=RobotCaptureResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_robot_capture(alert_key: str, request: Request) -> RobotCaptureResponse:
    """Persist a JPEG captured from robot monitoring for eligible safety alerts."""

    if alert_key not in ALLOWED_CAPTURE_ALERT_KEYS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="告警类型不支持抓拍")

    content_type = request.headers.get("content-type", "").split(";", maxsplit=1)[0].strip().lower()
    if content_type != "image/jpeg":
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="仅支持 JPEG 图片")

    content_length = request.headers.get("content-length")
    if content_length and content_length.isdecimal() and int(content_length) > MAX_CAPTURE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="抓拍图片过大")

    payload = await request.body()
    if len(payload) > MAX_CAPTURE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="抓拍图片过大")
    if not is_valid_jpeg(payload):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="无效的 JPEG 图片")

    settings = cast(Settings, request.app.state.settings)
    captured_at = datetime.now().astimezone()
    relative_path = Path(
        f"{captured_at:%Y}",
        f"{captured_at:%m}",
        f"{captured_at:%d}",
        f"{captured_at:%H%M%S}-{uuid4().hex}.jpg",
    )
    destination = settings.robot_capture_root / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(payload)

    base_url = str(request.base_url).rstrip("/")
    image_url = f"{base_url}{settings.api_v1_prefix}/robot-captures/{relative_path.as_posix()}"
    return RobotCaptureResponse(
        image_url=image_url,
        captured_at=captured_at.isoformat(timespec="seconds"),
    )


@router.get("/robot-captures/{year}/{month}/{day}/{filename}")
async def get_robot_capture(
    year: str,
    month: str,
    day: str,
    filename: str,
    request: Request,
) -> Response:
    """Serve only files created under the configured date-partitioned capture root."""

    settings = cast(Settings, request.app.state.settings)
    capture_file = resolve_capture_file(settings.robot_capture_root, year, month, day, filename)
    if capture_file is None or not capture_file.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="抓拍图片不存在")
    return FileResponse(capture_file, media_type="image/jpeg")
