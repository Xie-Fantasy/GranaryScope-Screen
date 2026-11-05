"""Thread-safe latest-only delivery for detection WebSocket clients."""

import asyncio
from threading import Lock
from typing import Final

from liangcang_backend.schemas.detection import DetectionFrameMetadata


class DetectionSubscription:
    """One bounded subscriber queue owned by an asyncio event loop."""

    def __init__(
        self,
        broker: "LatestDetectionBroker",
        subscription_id: int,
        loop: asyncio.AbstractEventLoop,
    ) -> None:
        self._broker = broker
        self._subscription_id = subscription_id
        self._loop = loop
        self._queue: asyncio.Queue[DetectionFrameMetadata] = asyncio.Queue(maxsize=1)
        self._closed = False

    async def receive(self) -> DetectionFrameMetadata:
        """Wait for the newest metadata published after subscription."""

        if self._closed:
            raise RuntimeError("detection subscription is closed")
        return await self._queue.get()

    def close(self) -> None:
        """Remove this subscription. Calling close repeatedly is safe."""

        if self._closed:
            return
        self._closed = True
        self._broker._unsubscribe(self._subscription_id)

    def publish_from_any_thread(self, metadata: DetectionFrameMetadata) -> bool:
        """Schedule a latest-only queue replacement on the owning loop."""

        if self._closed:
            return False
        try:
            self._loop.call_soon_threadsafe(self._replace_latest, metadata)
        except RuntimeError:
            self.close()
            return False
        return True

    def _replace_latest(self, metadata: DetectionFrameMetadata) -> None:
        if self._closed:
            return
        if self._queue.full():
            self._queue.get_nowait()
        self._queue.put_nowait(metadata)


class LatestDetectionBroker:
    """Broadcast detections without allowing slow clients to build a backlog."""

    _FIRST_SUBSCRIPTION_ID: Final = 1

    def __init__(self) -> None:
        self._lock = Lock()
        self._latest: DetectionFrameMetadata | None = None
        self._subscriptions: dict[int, DetectionSubscription] = {}
        self._next_subscription_id = self._FIRST_SUBSCRIPTION_ID

    def subscribe(self) -> DetectionSubscription:
        """Register the current asyncio loop as a latest-only consumer."""

        loop = asyncio.get_running_loop()
        with self._lock:
            subscription_id = self._next_subscription_id
            self._next_subscription_id += 1
            subscription = DetectionSubscription(self, subscription_id, loop)
            self._subscriptions[subscription_id] = subscription
        return subscription

    def publish(self, metadata: DetectionFrameMetadata) -> None:
        """Store and broadcast a validated immutable metadata object."""

        if not isinstance(metadata, DetectionFrameMetadata):
            raise TypeError("metadata must be DetectionFrameMetadata")
        with self._lock:
            self._latest = metadata
            subscriptions = tuple(self._subscriptions.values())
        for subscription in subscriptions:
            subscription.publish_from_any_thread(metadata)

    def peek(self) -> DetectionFrameMetadata | None:
        """Return the latest detection without consuming it."""

        with self._lock:
            return self._latest

    @property
    def subscriber_count(self) -> int:
        """Return the active subscriber count for diagnostics and tests."""

        with self._lock:
            return len(self._subscriptions)

    def _unsubscribe(self, subscription_id: int) -> None:
        with self._lock:
            self._subscriptions.pop(subscription_id, None)
