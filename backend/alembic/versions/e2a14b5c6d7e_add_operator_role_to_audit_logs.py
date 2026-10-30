"""add operator_role to audit_logs

Revision ID: e2a14b5c6d7e
Revises: d03b6dc85ac0
Create Date: 2026-10-30 21:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2a14b5c6d7e'
down_revision: Union[str, None] = 'd03b6dc85ac0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('audit_logs')]
    if 'operator_role' not in columns:
        op.add_column(
            'audit_logs',
            sa.Column('operator_role', sa.String(length=20), server_default='user', nullable=True)
        )


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('audit_logs')]
    if 'operator_role' in columns:
        op.drop_column('audit_logs', 'operator_role')
