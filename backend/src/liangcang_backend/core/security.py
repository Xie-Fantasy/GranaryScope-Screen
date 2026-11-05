"""Helpers for preventing credentials from reaching logs or API output."""

from collections.abc import Mapping
from typing import Final
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

REDACTED: Final = "***"
_SENSITIVE_KEY_PARTS: Final = (
    "authorization",
    "credential",
    "password",
    "secret",
    "token",
    "api_key",
    "apikey",
    "rtsp_url",
)


def redact_url(value: str | None) -> str:
    """Mask user information and query values while retaining safe URL context.

    Invalid or non-URL input is fully redacted because it cannot be parsed safely.
    """

    if value is None or not value.strip():
        return ""

    candidate = value.strip()
    parts = urlsplit(candidate)
    if not parts.scheme or not parts.netloc:
        return REDACTED

    netloc = parts.netloc
    if "@" in netloc:
        _, host = netloc.rsplit("@", maxsplit=1)
        netloc = f"{REDACTED}:{REDACTED}@{host}"

    redacted_query = urlencode(
        [(key, REDACTED) for key, _ in parse_qsl(parts.query, keep_blank_values=True)],
        doseq=True,
    )
    redacted_fragment = REDACTED if parts.fragment else ""
    return urlunsplit(
        (parts.scheme, netloc, parts.path, redacted_query, redacted_fragment)
    )


def redact_mapping(values: Mapping[str, object]) -> dict[str, object]:
    """Return a shallow copy with common secret fields and URL credentials masked."""

    redacted: dict[str, object] = {}
    for key, value in values.items():
        normalized_key = key.casefold()
        if any(part in normalized_key for part in _SENSITIVE_KEY_PARTS):
            redacted[key] = REDACTED
        elif isinstance(value, str) and "://" in value:
            redacted[key] = redact_url(value)
        else:
            redacted[key] = value
    return redacted
