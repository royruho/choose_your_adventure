"""add json fields to stories and story_parts

Revision ID: a1b2c3d4e5f6
Revises: d5641e165982
Create Date: 2026-04-09

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'd5641e165982'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('stories', sa.Column('config', sa.JSON(), nullable=True))
    op.add_column('stories', sa.Column('character', sa.JSON(), nullable=True))
    op.add_column('story_parts', sa.Column('turn_number', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('story_parts', sa.Column('stats', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('story_parts', 'stats')
    op.drop_column('story_parts', 'turn_number')
    op.drop_column('stories', 'character')
    op.drop_column('stories', 'config')
