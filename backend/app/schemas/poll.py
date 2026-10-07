from pydantic import BaseModel, Field


class PollOptionResponse(BaseModel):
    id: int
    poll_id: int
    option: str

    model_config = {
        "from_attributes": True
    }


class PollCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=1000)
    options: list[str] = Field(..., min_length=2, description="At least 2 options required for a poll")



class PollResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    owner_id: int | None = None
    options: list[PollOptionResponse] = []

    model_config = {
        "from_attributes": True
    }