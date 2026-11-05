"""Contracts for browser-submitted robot-monitor snapshots."""

from pydantic import BaseModel, ConfigDict, Field


class RobotMonitorSourceResponse(BaseModel):
    """A credential-free browser source supplied by backend configuration."""

    model_config = ConfigDict(populate_by_name=True)

    stream_url: str = Field(serialization_alias="streamUrl")


class RobotCaptureResponse(BaseModel):
    """Public result of a persisted alert snapshot."""

    model_config = ConfigDict(populate_by_name=True)

    image_url: str = Field(serialization_alias="imageUrl")
    captured_at: str = Field(serialization_alias="capturedAt")
