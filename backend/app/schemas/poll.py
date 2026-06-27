from pydantic import BaseModel


class PollCreate(BaseModel):
    title: str
    description: str | None = None


class PollResponse(BaseModel):
    id: int
    title: str
    description: str | None = None

    model_config = {
        "from_attributes": True
    }