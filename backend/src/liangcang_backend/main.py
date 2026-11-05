"""FastAPI application factory and ASGI entry point."""

import logging
from collections.abc import Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from liangcang_backend import __version__
from liangcang_backend.api.routes.detections import router as detections_router
from liangcang_backend.api.routes.health import router as health_router
from liangcang_backend.api.routes.robot_monitor import router as robot_monitor_router
from liangcang_backend.core.config import Settings, get_settings
from liangcang_backend.core.detection_broker import LatestDetectionBroker
from liangcang_backend.core.security import redact_url
from liangcang_backend.inference.runtime import DetectionRuntime, RuntimeLifecycle


RuntimeFactory = Callable[[Settings, LatestDetectionBroker], RuntimeLifecycle]

logger = logging.getLogger(__name__)

# uvicorn 只配置自身 logger；应用日志需要自带 handler 才能出现在控制台。
if not logging.getLogger().handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )


def create_app(
    settings: Settings | None = None,
    runtime_factory: RuntimeFactory | None = None,
) -> FastAPI:
    """Create an application without importing optional AI/media packages."""

    resolved_settings = settings or get_settings()
    broker = LatestDetectionBroker()
    runtime = (runtime_factory or DetectionRuntime)(resolved_settings, broker)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        if resolved_settings.inference_enabled:
            logger.info(
                "推理已启用: source=%s model=%s device=%s imgsz=%d conf=%.2f target_fps=%.1f",
                redact_url(resolved_settings.inference_rtsp_url.get_secret_value()),
                resolved_settings.yolo_model_path.name,
                resolved_settings.inference_device,
                resolved_settings.inference_imgsz,
                resolved_settings.inference_conf,
                resolved_settings.inference_target_fps,
            )
        else:
            logger.info(
                "推理未启用（INFERENCE_ENABLED=false），仅启动 API；"
                "如需推理请设置 INFERENCE_ENABLED=true 后重启"
            )
        runtime.start()
        try:
            yield
        finally:
            runtime.stop()
            logger.info("推理运行时已停止")

    application = FastAPI(
        title=resolved_settings.app_name,
        version=__version__,
        lifespan=lifespan,
    )
    application.state.settings = resolved_settings
    application.state.detection_broker = broker
    application.state.detection_runtime = runtime
    application.add_middleware(
        CORSMiddleware,
        allow_origin_regex=resolved_settings.cors_allow_origin_regex,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )
    application.include_router(
        health_router,
        prefix=resolved_settings.api_v1_prefix,
    )
    application.include_router(
        detections_router,
        prefix=resolved_settings.api_v1_prefix,
    )
    application.include_router(
        robot_monitor_router,
        prefix=resolved_settings.api_v1_prefix,
    )
    return application


app = create_app()
