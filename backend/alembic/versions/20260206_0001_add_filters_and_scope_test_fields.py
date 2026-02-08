"""Add filters and scope filter test fields per filter.

Revision ID: 20260206_0001
Revises: 
Create Date: 2026-02-06 00:00:01
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260206_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "filters",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("filter_plant_id", sa.Integer(), nullable=False, unique=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=True),
    )
    op.create_foreign_key(
        "fk_filters_filter_plant_id",
        "filters",
        "filter_plants",
        ["filter_plant_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.add_column("filter_test_fields", sa.Column("filter_id", sa.Integer(), nullable=True))
    op.create_index(
        "ix_filter_test_fields_filter_id",
        "filter_test_fields",
        ["filter_id"],
    )
    op.create_foreign_key(
        "fk_filter_test_fields_filter_id",
        "filter_test_fields",
        "filters",
        ["filter_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # Drop old unique constraint on label (name depends on backend, try common name).
    with op.get_context().autocommit_block():
        try:
            op.drop_constraint("filter_test_fields_label_key", "filter_test_fields", type_="unique")
        except Exception:
            pass

    conn = op.get_bind()
    plants = conn.execute(sa.text("SELECT id FROM filter_plants")).fetchall()
    global_fields = conn.execute(
        sa.text(
            "SELECT id, label, field_type, unit, options, required, min_value, max_value "
            "FROM filter_test_fields WHERE filter_id IS NULL"
        )
    ).fetchall()

    for plant in plants:
        filter_id = conn.execute(
            sa.text(
                "INSERT INTO filters (filter_plant_id, name, description) "
                "VALUES (:plant_id, :name, :description) RETURNING id"
            ),
            {"plant_id": plant.id, "name": "Standardfilter", "description": "Migration"},
        ).scalar()

        id_map = {}
        for field in global_fields:
            new_id = conn.execute(
                sa.text(
                    "INSERT INTO filter_test_fields "
                    "(filter_id, label, field_type, unit, options, required, min_value, max_value) "
                    "VALUES (:filter_id, :label, :field_type, :unit, :options, :required, :min_value, :max_value) "
                    "RETURNING id"
                ),
                {
                    "filter_id": filter_id,
                    "label": field.label,
                    "field_type": field.field_type,
                    "unit": field.unit,
                    "options": field.options,
                    "required": field.required,
                    "min_value": field.min_value,
                    "max_value": field.max_value,
                },
            ).scalar()
            id_map[field.id] = new_id

        if id_map:
            for old_id, new_id in id_map.items():
                conn.execute(
                    sa.text(
                        "UPDATE filter_report_values SET filter_test_field_id = :new_id "
                        "WHERE report_id IN (SELECT id FROM reports WHERE filter_plant_id = :plant_id) "
                        "AND filter_test_field_id = :old_id"
                    ),
                    {"new_id": new_id, "plant_id": plant.id, "old_id": old_id},
                )

    conn.execute(sa.text("DELETE FROM filter_test_fields WHERE filter_id IS NULL"))

    op.alter_column("filter_test_fields", "filter_id", nullable=False)
    op.create_unique_constraint(
        "uq_filter_test_field", "filter_test_fields", ["filter_id", "label"]
    )


def downgrade() -> None:
    op.drop_constraint("uq_filter_test_field", "filter_test_fields", type_="unique")
    op.drop_constraint("fk_filter_test_fields_filter_id", "filter_test_fields", type_="foreignkey")
    op.drop_index("ix_filter_test_fields_filter_id", table_name="filter_test_fields")
    op.drop_column("filter_test_fields", "filter_id")
    op.drop_constraint("fk_filters_filter_plant_id", "filters", type_="foreignkey")
    op.drop_table("filters")
