"""add poll owner and vote constraint

Revision ID: 5a1b2c3d4e5f
Revises: 473339a4b9a1
Create Date: 2026-10-07 08:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5a1b2c3d4e5f'
down_revision: Union[str, Sequence[str], None] = '473339a4b9a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    
    if 'polls' in inspector.get_table_names():
        columns = [c['name'] for c in inspector.get_columns('polls')]
        if 'owner_id' not in columns:
            op.add_column('polls', sa.Column('owner_id', sa.Integer(), nullable=True))
            try:
                op.create_foreign_key('fk_polls_owner_id_users', 'polls', 'users', ['owner_id'], ['id'])
            except Exception:
                pass

    if 'votes' in inspector.get_table_names():
        constraints = [c['name'] for c in inspector.get_unique_constraints('votes')]
        if 'uq_user_poll_vote' not in constraints:
            try:
                op.create_unique_constraint('uq_user_poll_vote', 'votes', ['user_id', 'poll_id'])
            except Exception:
                pass


def downgrade() -> None:
    pass
