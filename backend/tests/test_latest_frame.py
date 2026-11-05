"""Latest-frame overwrite and thread-safety tests."""

from concurrent.futures import ThreadPoolExecutor

import pytest

from liangcang_backend.core.latest_frame import LatestFrameSlot


def test_new_value_overwrites_stale_value_without_fifo_growth() -> None:
    slot = LatestFrameSlot[int]()

    assert slot.put(100) is False
    assert slot.put(101) is True
    assert slot.put(102) is True

    assert len(slot) == 1
    assert slot.take() == 102
    assert slot.take() is None
    assert len(slot) == 0


def test_peek_does_not_consume_and_clear_reports_discard() -> None:
    slot = LatestFrameSlot[str]()
    slot.put("frame-current")

    assert slot.peek() == "frame-current"
    assert slot.peek() == "frame-current"
    assert slot.clear() is True
    assert slot.clear() is False
    assert slot.peek() is None


def test_none_is_reserved_for_empty_state() -> None:
    slot = LatestFrameSlot[object]()

    with pytest.raises(ValueError, match="reserved"):
        slot.put(None)  # type: ignore[arg-type]


def test_concurrent_writers_preserve_capacity_one() -> None:
    slot = LatestFrameSlot[int]()

    with ThreadPoolExecutor(max_workers=8) as executor:
        list(executor.map(slot.put, range(2_000)))

    # Concurrent completion order is intentionally unspecified. A final write
    # proves the bounded slot remains usable and deterministic after contention.
    slot.put(2_000)
    assert len(slot) == 1
    assert slot.take() == 2_000
    assert len(slot) == 0
