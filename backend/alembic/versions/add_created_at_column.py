"""Add created_at column to installments

Revision ID: add_created_at_column
Revises: 
Create Date: 2023-11-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_created_at_column'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add created_at column with default current timestamp
    op.add_column('installments', sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False))


def downgrade() -> None:
    # Remove created_at column
    op.drop_column('installments', 'created_at')
