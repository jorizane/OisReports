"""merge heads

Revision ID: ff77a7b7e42f
Revises: 20260206_0001, acae06623e7b
Create Date: 2026-02-08 21:43:05.459593
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ff77a7b7e42f'
down_revision = ('20260206_0001', 'acae06623e7b')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
