from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.poll_option import PollOption


class Poll(Base):
    __tablename__ = "polls"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        String(1000),
        nullable=True
    )

    owner_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )

    options: Mapped[list["PollOption"]] = relationship(
        "PollOption",
        back_populates="poll",
        cascade="all, delete-orphan"
    )