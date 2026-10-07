from sqlalchemy import Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (
        UniqueConstraint("user_id", "poll_id", name="uq_user_poll_vote"),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    poll_id: Mapped[int] = mapped_column(
        ForeignKey("polls.id"),
        nullable=False
    )

    option: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )