"""Add created_at column to installments

Revision ID: 30eb3abe5954
Revises: add_created_at_column
Create Date: 2025-04-15 23:47:52.268118

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '30eb3abe5954'
down_revision: Union[str, None] = 'add_created_at_column'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to add timezone support to datetime columns."""
    # Modify created_at column in installments table to use timezone
    op.alter_column('installments', 'created_at',
               existing_type=sa.DateTime(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=False,
               postgresql_using="created_at AT TIME ZONE 'UTC'")
    
    # Modify due_date column in installments table to use timezone
    op.alter_column('installments', 'due_date',
               existing_type=sa.DateTime(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               postgresql_using="due_date AT TIME ZONE 'UTC'")
    
    # Modify payment_date column in payments table to use timezone
    op.alter_column('payments', 'payment_date',
               existing_type=sa.DateTime(),
               type_=sa.DateTime(timezone=True),
               existing_nullable=True,
               postgresql_using="payment_date AT TIME ZONE 'UTC'")


def downgrade() -> None:
    """Downgrade schema to remove timezone support from datetime columns."""
    # Revert created_at column in installments table to not use timezone
    op.alter_column('installments', 'created_at',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=False,
               postgresql_using="created_at AT TIME ZONE 'UTC'")
    
    # Revert due_date column in installments table to not use timezone
    op.alter_column('installments', 'due_date',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=True,
               postgresql_using="due_date AT TIME ZONE 'UTC'")
    
    # Revert payment_date column in payments table to not use timezone
    op.alter_column('payments', 'payment_date',
               existing_type=sa.DateTime(timezone=True),
               type_=sa.DateTime(),
               existing_nullable=True,
               postgresql_using="payment_date AT TIME ZONE 'UTC'")
