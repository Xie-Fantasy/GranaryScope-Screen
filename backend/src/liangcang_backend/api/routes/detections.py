"""Latest-only detection metadata WebSocket."""

import asyncio
import logging
from contextlib import suppress
from typing import cast

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from liangcang_backend.core.detection_broker import LatestDetectionBroker

logger = logging.getLogger(__name__)

router = APIRouter(tags=["detections"])


@router.websocket("/ws/detections")
async def detection_websocket(websocket: WebSocket) -> None:
    """Send camelCase metadata while bounding each client queue to one item."""

    await websocket.accept()
    broker = cast(LatestDetectionBroker, websocket.app.state.detection_broker)
    runtime = websocket.app.state.detection_runtime
    snapshot = runtime.snapshot()
    logger.info(
        "检测 WebSocket 客户端已连接 (当前订阅数=%d, 推理状态=%s)",
        broker.subscriber_count + 1,
        snapshot.phase.value,
    )
    if not snapshot.enabled:
        logger.warning(
            "推理未启用（INFERENCE_ENABLED=false），该客户端不会收到任何检测数据"
        )
    subscription = broker.subscribe()
    detection_task = asyncio.create_task(subscription.receive())
    incoming_task = asyncio.create_task(websocket.receive())
    try:
        while True:
            completed, _ = await asyncio.wait(
                (detection_task, incoming_task),
                return_when=asyncio.FIRST_COMPLETED,
            )
            if incoming_task in completed:
                message = incoming_task.result()
                if message["type"] == "websocket.disconnect":
                    break
                incoming_task = asyncio.create_task(websocket.receive())
            if detection_task in completed:
                metadata = detection_task.result()
                await websocket.send_json(
                    metadata.model_dump(by_alias=True, mode="json")
                )
                detection_task = asyncio.create_task(subscription.receive())
    except WebSocketDisconnect:
        pass
    finally:
        detection_task.cancel()
        incoming_task.cancel()
        with suppress(asyncio.CancelledError):
            await detection_task
        with suppress(asyncio.CancelledError):
            await incoming_task
        subscription.close()
        logger.info("检测 WebSocket 客户端已断开 (剩余订阅数=%d)", broker.subscriber_count)
