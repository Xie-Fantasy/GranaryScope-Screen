"""Credential redaction tests."""

from liangcang_backend.core.security import REDACTED, redact_mapping, redact_url


def test_redact_url_masks_credentials_query_and_fragment() -> None:
    source = (
        "rtsp://placeholder-user:placeholder-password@camera.example.local/live"
        "?access_token=placeholder-token#private-fragment"
    )

    result = redact_url(source)

    assert result == (
        "rtsp://***:***@camera.example.local/live?access_token=%2A%2A%2A#***"
    )
    assert "placeholder-user" not in result
    assert "placeholder-password" not in result
    assert "placeholder-token" not in result
    assert "private-fragment" not in result


def test_redact_url_hides_unparseable_input() -> None:
    assert redact_url("placeholder-password-without-a-url") == REDACTED


def test_redact_mapping_masks_sensitive_fields_and_embedded_urls() -> None:
    result = redact_mapping(
        {
            "camera_rtsp_url": "rtsp://user:password@camera.example.local/live",
            "authorization": "Bearer placeholder-token",
            "endpoint": "https://user:password@example.local/resource?token=value",
            "status": "ready",
        }
    )

    assert result["camera_rtsp_url"] == REDACTED
    assert result["authorization"] == REDACTED
    assert result["endpoint"] == (
        "https://***:***@example.local/resource?token=%2A%2A%2A"
    )
    assert result["status"] == "ready"
