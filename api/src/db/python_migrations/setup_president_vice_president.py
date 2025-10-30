#!/usr/bin/env python3
"""
Setup President and Vice President positions for SJBU Voting System
Author: System
Date: 2025-10-19

This script sets up the two main positions (President and Vice President)
and ensures they are the only positions available in the system.
"""

import psycopg2
import sys
from datetime import datetime

def main():
    # Database connection
    DATABASE_URL = 'postgres://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require'

    # Migration SQL
    migration_sql = """
    -- Setup President and Vice President positions
    -- Migration: 003_setup_president_vice_president
    -- Created: 2025-10-19

    -- Clear existing positions (if any)
    DELETE FROM "Position";

    -- Insert President position
    INSERT INTO "Position" ("position_name") VALUES ('President');

    -- Insert Vice President position
    INSERT INTO "Position" ("position_name") VALUES ('Vice President');

    -- Verify positions were created
    SELECT id, position_name FROM "Position" ORDER BY id;
    """

    try:
        print("Starting setup of President and Vice President positions...")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Execute the migration
        cur.execute(migration_sql)
        conn.commit()

        print("Positions setup completed successfully!")

        # Verify the positions were created
        cur.execute('SELECT id, position_name FROM "Position" ORDER BY id')
        positions = cur.fetchall()

        print(f"Created {len(positions)} positions:")
        for position in positions:
            print(f"   ID: {position[0]}, Name: {position[1]}")

        # Confirm connection
        cur.execute("SELECT version()")
        version = cur.fetchone()[0]
        print(f"Connected to: {version}")

        print(f"Setup completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    except Exception as e:
        print(f"Setup failed: {e}")
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