#!/usr/bin/env python3
"""
Add created_at column to User table for SJBU Voting System
Author: System
Date: 2025-10-18

This script adds the missing created_at column to the User table
to support voter demographics and registration trends functionality.
"""

import psycopg2
import sys
from datetime import datetime

def main():
    # Database connection
    DATABASE_URL = 'postgres://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require'

    # Migration SQL
    migration_sql = """
    -- Add created_at column to User table
    -- Migration: 002_add_user_created_at
    -- Created: 2025-10-18

    -- Add created_at column with default value for existing records
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    -- Update existing records to have a created_at value
    -- Since we don't know when users were actually created, we'll use current timestamp
    -- In a production system, you might want to use a more appropriate default date
    UPDATE "User"
    SET created_at = CURRENT_TIMESTAMP
    WHERE created_at IS NULL;

    -- Make the column NOT NULL after setting values
    ALTER TABLE "User"
    ALTER COLUMN "created_at" SET NOT NULL;

    -- Create index for better performance on created_at queries
    CREATE INDEX IF NOT EXISTS idx_user_created_at ON "User"("created_at");

    -- Add comment to document the column
    COMMENT ON COLUMN "User"."created_at" IS 'Timestamp when the user record was created';
    """

    try:
        print("Starting migration to add created_at column to User table...")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Execute the migration
        cur.execute(migration_sql)
        conn.commit()

        print("Migration completed successfully!")

        # Verify the column was added
        cur.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'User' AND column_name = 'created_at'
        """)

        column_info = cur.fetchone()
        if column_info:
            print(f"Verified: created_at column added - {column_info[1]}, nullable: {column_info[2]}")
        else:
            print("Warning: created_at column not found after migration")

        # Count total users
        cur.execute("SELECT COUNT(*) as count FROM \"User\"")
        user_count = cur.fetchone()[0]
        print(f"Total users in system: {user_count}")

        # Show sample of users with created_at
        cur.execute("SELECT id, voucher, created_at FROM \"User\" LIMIT 3")
        sample_users = cur.fetchall()
        print("Sample users with created_at:")
        for user in sample_users:
            print(f"   ID: {user[0]}, Voucher: {user[1]}, Created: {user[2]}")

        # Confirm connection
        cur.execute("SELECT version()")
        version = cur.fetchone()[0]
        print(f"Connected to: {version}")

        print(f"Migration completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    except Exception as e:
        print(f"Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
        sys.exit(1)

    finally:
        if 'cur' in locals() and 'conn' in locals():
            cur.close()
            conn.close()
            print("Connection closed.")

if __name__ == "__main__":
    main()