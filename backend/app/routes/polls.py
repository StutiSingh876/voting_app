from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.dependencies import get_db
from app.models.poll import Poll
from app.models.poll_option import PollOption
from app.models.vote import Vote
from app.core.auth import get_current_user
from app.core.metrics import polls_created_total, votes_cast_total
from app.schemas.poll import (
    PollCreate,
    PollResponse,
    PollOptionResponse
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
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["sub"])

    db_poll = Poll(
        title=poll.title,
        description=poll.description,
        owner_id=user_id
    )
    db.add(db_poll)
    db.flush()

    for option_text in poll.options:
        clean_text = option_text.strip()
        if clean_text:
            db_option = PollOption(
                poll_id=db_poll.id,
                option=clean_text
            )
            db.add(db_option)

    db.commit()
    db.refresh(db_poll)
    polls_created_total.inc()

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
    user_id = int(current_user["sub"])

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

    valid_option = (
        db.query(PollOption)
        .filter(
            PollOption.poll_id == poll_id,
            PollOption.option == vote.option
        )
        .first()
    )
    if not valid_option:
        raise HTTPException(
            status_code=400,
            detail="Invalid option for this poll"
        )

    existing_vote = (
        db.query(Vote)
        .filter(
            Vote.user_id == user_id,
            Vote.poll_id == poll_id
        )
        .first()
    )
    if existing_vote:
        raise HTTPException(
            status_code=400,
            detail="User has already voted in this poll"
        )

    db_vote = Vote(
        user_id=user_id,
        poll_id=poll_id,
        option=vote.option
    )

    try:
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="User has already voted in this poll"
        )

    votes_cast_total.inc()
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

    options = (
        db.query(PollOption)
        .filter(PollOption.poll_id == poll_id)
        .all()
    )

    results = {opt.option: 0 for opt in options}

    votes = (
        db.query(Vote)
        .filter(Vote.poll_id == poll_id)
        .all()
    )

    for vote in votes:
        if vote.option in results:
            results[vote.option] += 1
        else:
            results[vote.option] = 1

    return {
        "poll_id": poll_id,
        "results": results
    }


@router.get(
    "/{poll_id}/options",
    response_model=list[PollOptionResponse]
)
def get_poll_options(
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

    return poll.options