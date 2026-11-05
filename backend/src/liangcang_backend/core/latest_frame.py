"""Thread-safe, non-blocking storage for the newest decoded frame."""

from threading import Lock
from typing import Generic, TypeVar, cast

T = TypeVar("T")
_EMPTY = object()


class LatestFrameSlot(Generic[T]):
    """Store at most one item and replace stale data with every new item.

    ``None`` is reserved as the empty result. All public operations only hold a
    small in-process lock while reading or replacing one reference; they never
    wait for an item and are therefore safe to call from API-side status code.
    """

    def __init__(self) -> None:
        self._lock = Lock()
        self._value: T | object = _EMPTY

    def put(self, value: T) -> bool:
        """Store ``value``, returning whether an older unconsumed value existed."""

        if value is None:
            raise ValueError("None is reserved for an empty LatestFrameSlot")

        with self._lock:
            replaced = self._value is not _EMPTY
            self._value = value
            return replaced

    def peek(self) -> T | None:
        """Return the current value without consuming it, or ``None`` if empty."""

        with self._lock:
            if self._value is _EMPTY:
                return None
            return cast(T, self._value)

    def take(self) -> T | None:
        """Atomically return and clear the current value, or ``None`` if empty."""

        with self._lock:
            if self._value is _EMPTY:
                return None
            value = cast(T, self._value)
            self._value = _EMPTY
            return value

    def clear(self) -> bool:
        """Clear the slot, returning whether a value was discarded."""

        with self._lock:
            had_value = self._value is not _EMPTY
            self._value = _EMPTY
            return had_value

    def __len__(self) -> int:
        """Return the bounded capacity usage (always zero or one)."""

        with self._lock:
            return int(self._value is not _EMPTY)
