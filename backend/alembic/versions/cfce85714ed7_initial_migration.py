"""initial migration

Revision ID: cfce85714ed7
Revises: 
Create Date: 2026-07-26 10:52:57.973114

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from app.db.base import Base

import app.models.user
import app.models.poll
import app.models.poll_option
import app.models.vote

# revision identifiers, used by Alembic.
revision: str = 'cfce85714ed7'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    """Downgrade schema."""
    pass
