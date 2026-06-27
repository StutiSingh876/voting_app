from pydantic import BaseModel


class VoteCreate(BaseModel):
    option: str


class VoteResponse(BaseModel):
    id: int
    user_id: int
    poll_id: int
    option: str

    model_config = {
        "from_attributes": True
    }