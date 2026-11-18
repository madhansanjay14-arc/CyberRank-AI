
from sqlalchemy import inspect, text
from backend.database import engine

def migrate_database():
    inspector = inspect(engine)

    columns = {
        column["name"]
        for column in inspector.get_columns("incidents")
    }

    migrations = {
        "status": "ALTER TABLE incidents ADD COLUMN status VARCHAR DEFAULT 'OPEN'",
        "assigned_to": "ALTER TABLE incidents ADD COLUMN assigned_to VARCHAR",
        "investigation_notes": "ALTER TABLE incidents ADD COLUMN investigation_notes VARCHAR",
        "created_at": "ALTER TABLE incidents ADD COLUMN created_at DATETIME",
        "updated_at": "ALTER TABLE incidents ADD COLUMN updated_at DATETIME",
    }

    with engine.begin() as connection:

        for column, query in migrations.items():

            if column not in columns:
                connection.execute(text(query))
                print(f"Added column: {column}")
            else:
                print(f"Already exists: {column}")

        connection.execute(text("""
            UPDATE incidents
            SET status = 'OPEN'
            WHERE status IS NULL
        """))

        connection.execute(text("""
            UPDATE incidents
            SET created_at = CURRENT_TIMESTAMP
            WHERE created_at IS NULL
        """))

        connection.execute(text("""
            UPDATE incidents
            SET updated_at = CURRENT_TIMESTAMP
            WHERE updated_at IS NULL
        """))

    print("\nCyberRank AI database migration completed!")


if __name__ == "__main__":
    migrate_database()
