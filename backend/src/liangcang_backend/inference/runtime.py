"""Non-blocking RTSP decode and YOLO inference workers."""

from __future__ import annotations

import logging
import math
import threading
import time
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import TYPE_CHECKING, Any, Protocol

from liangcang_backend.core.config import Settings
from liangcang_backend.core.detection_broker import LatestDetectionBroker
from liangcang_backend.core.latest_frame import LatestFrameSlot
from liangcang_backend.core.security import redact_url
from liangcang_backend.schemas.detection import (
    Detection,
    DetectionFrameMetadata,
    NormalizedBoundingBox,
)

if TYPE_CHECKING:
    import numpy as np

logger = logging.getLogger(__name__)


class RuntimePhase(str, Enum):
    """Coarse worker state safe to expose in local diagnostics."""

    DISABLED = "disabled"
    STARTING = "starting"
    CONNECTING = "connecting"
    RUNNING = "running"
    RECONNECTING = "reconnecting"
    ERROR = "error"
    STOPPED = "stopped"


@dataclass(frozen=True, slots=True)
class DecodedFrame:
    """One decoded BGR frame and its source timing metadata."""

    image: np.ndarray[Any, Any]
    frame_id: int
    captured_at_ms: int
    source_timestamp: float | None


@dataclass(frozen=True, slots=True)
class RuntimeSnapshot:
    """Thread-safe immutable snapshot of runtime progress."""

    enabled: bool
    phase: RuntimePhase
    decoded_frames: int
    inferred_frames: int
    last_error_type: str | None


class RuntimeLifecycle(Protocol):
    """Lifecycle interface used by the FastAPI application factory."""

    def start(self) -> None: ...

    def stop(self) -> None: ...


class DetectionRuntime:
    """Own independent decode and inference threads for one camera."""

    _MIN_RECONNECT_DELAY_SECONDS = 0.5
    _MAX_RECONNECT_DELAY_SECONDS = 15.0
    _HEARTBEAT_FRAME_INTERVAL = 300
    # 时序过滤：目标至少连续出现这么多帧才对外发布，抑制单帧闪现误检。
    _MIN_TRACK_HITS = 3
    # 目标这么多帧未再出现后清除其计数状态。
    _TRACK_MISS_LIMIT_FRAMES = 50

    def __init__(
        self,
        settings: Settings,
        broker: LatestDetectionBroker,
    ) -> None:
        self._settings = settings
        self._broker = broker
        self._frames: LatestFrameSlot[DecodedFrame] = LatestFrameSlot()
        self._stop_event = threading.Event()
        self._state_lock = threading.Lock()
        self._lifecycle_lock = threading.Lock()
        self._decode_thread: threading.Thread | None = None
        self._inference_thread: threading.Thread | None = None
        self._phase = (
            RuntimePhase.STOPPED
            if self._settings.inference_enabled
            else RuntimePhase.DISABLED
        )
        self._decoded_frames = 0
        self._inferred_frames = 0
        self._last_error_type: str | None = None
        # track_id -> (出现帧数, 最近出现的 frame_id)；仅推理线程读写。
        self._track_states: dict[int, tuple[int, int]] = {}

    def start(self) -> None:
        """Start daemon workers only when inference is explicitly enabled."""

        if not self._settings.inference_enabled:
            self._set_phase(RuntimePhase.DISABLED)
            return
        with self._lifecycle_lock:
            if self._decode_thread and self._decode_thread.is_alive():
                return
            self._stop_event.clear()
            self._set_phase(RuntimePhase.STARTING, clear_error=True)
            self._decode_thread = threading.Thread(
                target=self._decode_loop,
                name="liangcang-rtsp-decoder",
                daemon=True,
            )
            self._inference_thread = threading.Thread(
                target=self._inference_loop,
                name="liangcang-yolo-inference",
                daemon=True,
            )
            self._decode_thread.start()
            self._inference_thread.start()

    def stop(self) -> None:
        """Signal both workers and wait briefly for a clean application exit."""

        with self._lifecycle_lock:
            self._stop_event.set()
            threads = (self._decode_thread, self._inference_thread)
            for thread in threads:
                if thread and thread.is_alive():
                    thread.join(timeout=3.0)
            self._frames.clear()
            self._track_states.clear()
            self._decode_thread = None
            self._inference_thread = None
            self._set_phase(
                RuntimePhase.STOPPED
                if self._settings.inference_enabled
                else RuntimePhase.DISABLED
            )

    def snapshot(self) -> RuntimeSnapshot:
        """Read counters and state without waiting for either worker."""

        with self._state_lock:
            return RuntimeSnapshot(
                enabled=self._settings.inference_enabled,
                phase=self._phase,
                decoded_frames=self._decoded_frames,
                inferred_frames=self._inferred_frames,
                last_error_type=self._last_error_type,
            )

    def _decode_loop(self) -> None:
        reconnect_delay = self._MIN_RECONNECT_DELAY_SECONDS
        frame_id = 0
        safe_source = redact_url(
            self._settings.inference_rtsp_url.get_secret_value()
        )
        while not self._stop_event.is_set():
            self._set_phase(RuntimePhase.CONNECTING)
            try:
                av = _import_av()
                source = self._settings.inference_rtsp_url.get_secret_value()
                with av.open(
                    source,
                    mode="r",
                    options={"rtsp_transport": "tcp"},
                    timeout=(5.0, 2.0),
                ) as container:
                    reconnect_delay = self._MIN_RECONNECT_DELAY_SECONDS
                    logger.info("RTSP 解码已连接: %s", safe_source)
                    self._set_phase(RuntimePhase.RUNNING, clear_error=True)
                    for video_frame in container.decode(video=0):
                        if self._stop_event.is_set():
                            return
                        source_timestamp = _source_timestamp(video_frame)
                        frame = DecodedFrame(
                            image=video_frame.to_ndarray(format="bgr24"),
                            frame_id=frame_id,
                            captured_at_ms=_now_ms(),
                            source_timestamp=source_timestamp,
                        )
                        self._frames.put(frame)
                        frame_id += 1
                        self._increment_decoded()
                        if frame_id % self._HEARTBEAT_FRAME_INTERVAL == 0:
                            logger.info(
                                "解码心跳: 已解码 %d 帧 (最近帧 %dx%d)",
                                frame_id,
                                frame.image.shape[1],
                                frame.image.shape[0],
                            )
                if not self._stop_event.is_set():
                    raise EOFError("RTSP stream ended")
            except Exception as exc:  # worker boundary; retries are intentional
                if self._stop_event.is_set():
                    return
                error_type = type(exc).__name__
                self._set_phase(RuntimePhase.RECONNECTING, error_type=error_type)
                logger.warning(
                    "RTSP decoder unavailable for %s; retrying in %.1fs (%s)",
                    safe_source,
                    reconnect_delay,
                    error_type,
                )
                if self._stop_event.wait(reconnect_delay):
                    return
                reconnect_delay = min(
                    reconnect_delay * 2,
                    self._MAX_RECONNECT_DELAY_SECONDS,
                )

    def _inference_loop(self) -> None:
        try:
            model = _load_yolo_model(self._settings.yolo_model_path)
        except Exception as exc:  # optional dependency/model boundary
            error_type = type(exc).__name__
            self._set_phase(RuntimePhase.ERROR, error_type=error_type)
            logger.error(
                "YOLO 模型加载失败 (%s): %s",
                error_type,
                self._settings.yolo_model_path,
            )
            self._stop_event.set()
            return

        class_filter = self._settings.inference_classes
        logger.info(
            "YOLO 模型已加载: %s (device=%s imgsz=%d conf=%.2f target_fps=%.1f classes=%s)",
            self._settings.yolo_model_path.name,
            self._settings.inference_device,
            self._settings.inference_imgsz,
            self._settings.inference_conf,
            self._settings.inference_target_fps,
            class_filter if class_filter is not None else "全部",
        )

        interval = 1.0 / self._settings.inference_target_fps
        next_inference_at = 0.0
        while not self._stop_event.is_set():
            now = time.monotonic()
            if now < next_inference_at:
                self._stop_event.wait(min(next_inference_at - now, 0.05))
                continue
            frame = self._frames.take()
            if frame is None:
                self._stop_event.wait(0.01)
                continue
            started_at_ms = _now_ms()
            try:
                result = model.track(
                    source=frame.image,
                    imgsz=self._settings.inference_imgsz,
                    conf=self._settings.inference_conf,
                    classes=class_filter,
                    device=self._settings.inference_device,
                    persist=True,
                    verbose=False,
                )[0]
                finished_at_ms = _now_ms()
                metadata = detection_metadata_from_result(
                    result=result,
                    frame=frame,
                    camera_id=self._settings.camera_id,
                    model_path=self._settings.yolo_model_path,
                    inference_started_at_ms=started_at_ms,
                    inference_finished_at_ms=finished_at_ms,
                )
                metadata = self._filter_transient_tracks(metadata)
                self._broker.publish(metadata)
                self._increment_inferred()
                if self._inferred_frames % self._HEARTBEAT_FRAME_INTERVAL == 0:
                    logger.info(
                        "推理心跳: 已推理 %d 帧，最近一帧检出 %d 个目标",
                        self._inferred_frames,
                        len(metadata.detections),
                    )
                self._set_phase(RuntimePhase.RUNNING, clear_error=True)
            except Exception as exc:  # keep later frames available after one failure
                error_type = type(exc).__name__
                self._set_phase(RuntimePhase.ERROR, error_type=error_type)
                logger.warning("YOLO 推理单帧失败 (%s)", error_type)
            next_inference_at = time.monotonic() + interval

    def _filter_transient_tracks(
        self,
        metadata: DetectionFrameMetadata,
    ) -> DetectionFrameMetadata:
        """时序过滤：抑制偶现目标。

        只发布累计出现至少 ``_MIN_TRACK_HITS`` 帧的 track；未获得 track id
        的单帧框直接丢弃。目标长时间未出现后清除其计数状态（重现视为新目标）。
        """

        stale_ids = [
            track_id
            for track_id, (_, last_frame_id) in self._track_states.items()
            if metadata.frame_id - last_frame_id > self._TRACK_MISS_LIMIT_FRAMES
        ]
        for track_id in stale_ids:
            del self._track_states[track_id]

        kept: list[Detection] = []
        for detection in metadata.detections:
            if detection.track_id is None:
                continue
            seen_count, _ = self._track_states.get(
                detection.track_id, (0, metadata.frame_id)
            )
            seen_count += 1
            self._track_states[detection.track_id] = (
                seen_count,
                metadata.frame_id,
            )
            if seen_count >= self._MIN_TRACK_HITS:
                kept.append(detection)

        if len(kept) == len(metadata.detections):
            return metadata
        return metadata.model_copy(update={"detections": kept})

    def _set_phase(
        self,
        phase: RuntimePhase,
        *,
        error_type: str | None = None,
        clear_error: bool = False,
    ) -> None:
        with self._state_lock:
            self._phase = phase
            if clear_error:
                self._last_error_type = None
            elif error_type is not None:
                self._last_error_type = error_type

    def _increment_decoded(self) -> None:
        with self._state_lock:
            self._decoded_frames += 1

    def _increment_inferred(self) -> None:
        with self._state_lock:
            self._inferred_frames += 1


def detection_metadata_from_result(
    *,
    result: Any,
    frame: DecodedFrame,
    camera_id: str,
    model_path: Path,
    inference_started_at_ms: int,
    inference_finished_at_ms: int,
) -> DetectionFrameMetadata:
    """Convert one Ultralytics result into the strict transport contract."""

    source_height, source_width = frame.image.shape[:2]
    names = result.names
    detections: list[Detection] = []
    boxes = result.boxes
    if boxes is not None:
        xyxy_values = boxes.xyxy.detach().cpu().tolist()
        confidence_values = boxes.conf.detach().cpu().tolist()
        class_values = boxes.cls.detach().cpu().tolist()
        raw_track_ids = getattr(boxes, "id", None)
        track_id_values: list[object] = (
            raw_track_ids.detach().cpu().tolist()
            if raw_track_ids is not None
            else [None] * len(xyxy_values)
        )
        for xyxy, confidence, class_value, track_id_value in zip(
            xyxy_values,
            confidence_values,
            class_values,
            track_id_values,
            strict=True,
        ):
            class_id = int(class_value)
            x1, y1, x2, y2 = (float(value) for value in xyxy)
            x1 = _clamp(x1, 0.0, float(source_width))
            y1 = _clamp(y1, 0.0, float(source_height))
            x2 = _clamp(x2, x1, float(source_width))
            y2 = _clamp(y2, y1, float(source_height))
            label = (
                str(names.get(class_id, class_id))
                if isinstance(names, dict)
                else str(names[class_id])
            )
            track_id = (
                int(track_id_value) if track_id_value is not None else None
            )
            detections.append(
                Detection(
                    class_id=class_id,
                    label=label,
                    confidence=_clamp(float(confidence), 0.0, 1.0),
                    bbox_norm=NormalizedBoundingBox(
                        x=x1 / source_width,
                        y=y1 / source_height,
                        w=(x2 - x1) / source_width,
                        h=(y2 - y1) / source_height,
                    ),
                    track_id=track_id,
                )
            )
    return DetectionFrameMetadata(
        camera_id=camera_id,
        frame_id=frame.frame_id,
        captured_at_ms=frame.captured_at_ms,
        source_timestamp=frame.source_timestamp,
        inference_started_at_ms=inference_started_at_ms,
        inference_finished_at_ms=inference_finished_at_ms,
        source_width=source_width,
        source_height=source_height,
        model_name=model_path.name,
        detections=detections,
    )


def _source_timestamp(video_frame: Any) -> float | None:
    if video_frame.pts is None or video_frame.time_base is None:
        return None
    value = float(video_frame.pts * video_frame.time_base)
    if not math.isfinite(value) or value < 0:
        return None
    return value


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def _now_ms() -> int:
    return time.time_ns() // 1_000_000


def _import_av() -> Any:
    import av

    return av


def _load_yolo_model(model_path: Path) -> Any:
    from ultralytics import YOLO

    return YOLO(str(model_path))
