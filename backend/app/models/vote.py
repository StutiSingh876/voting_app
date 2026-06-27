from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Vote(Base):
    __tablename__ = "votes"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    poll_id: Mapped[int] = mapped_column(
        ForeignKey("polls.id")
    )

    option: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )