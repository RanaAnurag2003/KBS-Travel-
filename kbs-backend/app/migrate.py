import sys
from sqlalchemy import text
from app.database import SessionLocal

MIGRATION_SQL = """
-- Create site_content table
CREATE TABLE IF NOT EXISTS site_content (
    `key` VARCHAR(255) PRIMARY KEY,
    value TEXT,
    draft_value TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create version_history table
CREATE TABLE IF NOT EXISTS version_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    data JSON NOT NULL,
    editor_name TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create import_history table
CREATE TABLE IF NOT EXISTS import_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    total_rows INT NOT NULL DEFAULT 0,
    imported INT NOT NULL DEFAULT 0,
    updated INT NOT NULL DEFAULT 0,
    failed INT NOT NULL DEFAULT 0,
    status VARCHAR(255) NOT NULL DEFAULT 'success',
    logs JSON NOT NULL,
    failed_rows_json JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add draft columns to packages table (Run these manually if needed since MySQL doesn't support IF NOT EXISTS in ALTER ADD)
-- ALTER TABLE packages ADD COLUMN draft_title TEXT;
-- ALTER TABLE packages ADD COLUMN draft_destination TEXT;
-- ALTER TABLE packages ADD COLUMN draft_price INT;
-- ALTER TABLE packages ADD COLUMN draft_duration TEXT;
-- ALTER TABLE packages ADD COLUMN draft_image TEXT;
-- ALTER TABLE packages ADD COLUMN draft_bullets JSON;
-- ALTER TABLE packages ADD COLUMN draft_tags JSON;
-- ALTER TABLE packages ADD COLUMN draft_categories JSON;
-- ALTER TABLE packages ADD COLUMN draft_tour_types JSON;
-- ALTER TABLE packages ADD COLUMN draft_popular_filters JSON;
-- ALTER TABLE packages ADD COLUMN draft_highlights JSON;
-- ALTER TABLE packages ADD COLUMN draft_inclusions JSON;
-- ALTER TABLE packages ADD COLUMN draft_exclusions JSON;
-- ALTER TABLE packages ADD COLUMN draft_stay_transfers TEXT;
-- ALTER TABLE packages ADD COLUMN has_draft BOOLEAN NOT NULL DEFAULT 0;
-- ALTER TABLE packages ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT 1;

-- Add draft columns to offers table
-- ALTER TABLE offers ADD COLUMN draft_title TEXT;
-- ALTER TABLE offers ADD COLUMN draft_subtitle TEXT;
-- ALTER TABLE offers ADD COLUMN draft_description TEXT;
-- ALTER TABLE offers ADD COLUMN draft_badge TEXT;
-- ALTER TABLE offers ADD COLUMN draft_badge_type TEXT;
-- ALTER TABLE offers ADD COLUMN draft_image TEXT;
-- ALTER TABLE offers ADD COLUMN draft_cta_label TEXT;
-- ALTER TABLE offers ADD COLUMN has_draft BOOLEAN NOT NULL DEFAULT 0;
-- ALTER TABLE offers ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT 1;

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_name TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT
);
"""

def run():
    print("Connecting to database and running migration...")
    db = SessionLocal()
    try:
        # Split statements and run them in transaction block
        statements = [stmt.strip() for stmt in MIGRATION_SQL.split(";") if stmt.strip()]
        for stmt in statements:
            db.execute(text(stmt))
        db.commit()
        print("Migration completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error executing migration: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run()
