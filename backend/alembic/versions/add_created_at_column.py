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
    # Check if column exists before adding it
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('installments')]
    
    if 'created_at' not in columns:
        # Add created_at column with default current timestamp
        op.add_column('installments', sa.Column('created_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False))


def downgrade() -> None:
    # Check if column exists before dropping it
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('installments')]
    
    if 'created_at' in columns:
        # Remove created_at column
        op.drop_column('installments', 'created_at')
