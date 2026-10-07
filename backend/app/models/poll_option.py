from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.poll import Poll


class PollOption(Base):
    __tablename__ = "poll_options"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    poll_id: Mapped[int] = mapped_column(
        ForeignKey("polls.id"),
        nullable=False
    )

    option: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    poll: Mapped["Poll"] = relationship(
        "Poll",
        back_populates="options"
    )