from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.vote import Vote
from app.core.auth import get_current_user
from app.models.user import User
from app.models.poll import Poll
from app.schemas.poll import (
    PollCreate,
    PollResponse
)
from app.schemas.vote import (
    VoteCreate,
    VoteResponse
)


router = APIRouter(
    prefix="/polls",
    tags=["Polls"]
)


@router.post(
    "",
    response_model=PollResponse
)
def create_poll(
    poll: PollCreate,
    db: Session = Depends(get_db)
):
    db_poll = Poll(
        title=poll.title,
        description=poll.description
    )

    db.add(db_poll)
    db.commit()
    db.refresh(db_poll)

    return db_poll


@router.get(
    "",
    response_model=list[PollResponse]
)
def get_polls(
    db: Session = Depends(get_db)
):
    return db.query(Poll).all()


@router.get(
    "/{poll_id}",
    response_model=PollResponse
)
def get_poll(
    poll_id: int,
    db: Session = Depends(get_db)
):
    poll = (
        db.query(Poll)
        .filter(Poll.id == poll_id)
        .first()
    )

    if not poll:
        raise HTTPException(
            status_code=404,
            detail="Poll not found"
        )
    
    return poll
@router.post(
    "/{poll_id}/vote",
    response_model=VoteResponse
)
def vote_poll(
    poll_id: int,
    vote: VoteCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    poll = (
        db.query(Poll)
        .filter(Poll.id == poll_id)
        .first()
    )
    if not poll:
        raise HTTPException(
            status_code=404,
            detail="Poll not found"
     
        )

    db_vote = Vote(
        user_id=int(current_user["sub"]),
        poll_id=poll_id,
        option=vote.option
    )

    db.add(db_vote)
    db.commit()
    db.refresh(db_vote)

    return db_vote

@router.get(
    "/{poll_id}/results"
)
def get_poll_results(
    poll_id: int,
    db: Session = Depends(get_db)
):

    poll = (
        db.query(Poll)
        .filter(Poll.id == poll_id)
        .first()
    )

    if not poll:
        raise HTTPException(
            status_code=404,
            detail="Poll not found"
        )

    votes = (
        db.query(Vote)
        .filter(Vote.poll_id == poll_id)
        .all()
    )

    results = {}

    for vote in votes:
        option = vote.option

        if option not in results:
            results[option] = 0

        results[option] += 1

    return {
        "poll_id": poll_id,
        "results": results
    }