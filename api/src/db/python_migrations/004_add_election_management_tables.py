#!/usr/bin/env python3
"""
Add election management tables for complete election control
Author: System
Date: 2025-10-20

This script adds the necessary database tables for election management
and runoff election functionality.
"""

import psycopg2
import sys
from datetime import datetime

def main():
    # Database connection
    DATABASE_URL = 'postgres://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require'

    # Migration SQL
    migration_sql = """
    -- Add election management tables for complete election control
    -- Migration: 004_add_election_management_tables
    -- Created: 2025-10-20

    -- Election status tracking table
    CREATE TABLE IF NOT EXISTS "ElectionStatus" (
        "id" SERIAL PRIMARY KEY,
        "status" VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'active', 'paused', 'completed', 'cancelled')),
        "started_at" TIMESTAMP,
        "paused_at" TIMESTAMP,
        "completed_at" TIMESTAMP,
        "cancelled_at" TIMESTAMP,
        "settings" JSONB DEFAULT '{"allowVoting": false, "showResults": false, "requireVerification": true}',
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create trigger to update updated_at timestamp (only if it doesn't exist)
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_election_status_updated_at') THEN
            CREATE TRIGGER update_election_status_updated_at
                BEFORE UPDATE ON "ElectionStatus"
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END $$;

    -- Runoff election management tables
    CREATE TABLE IF NOT EXISTS "RunoffElection" (
        "id" SERIAL PRIMARY KEY,
        "original_position_id" INTEGER NOT NULL REFERENCES "Position"("id"),
        "original_position_name" VARCHAR(100) NOT NULL,
        "tied_candidates" JSONB NOT NULL,
        "status" VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
        "started_at" TIMESTAMP,
        "completed_at" TIMESTAMP,
        "winner_candidate_id" INTEGER,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create trigger for runoff election updates (only if it doesn't exist)
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_runoff_election_updated_at') THEN
            CREATE TRIGGER update_runoff_election_updated_at
                BEFORE UPDATE ON "RunoffElection"
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END $$;

    -- Runoff candidates table
    CREATE TABLE IF NOT EXISTS "RunoffCandidate" (
        "id" SERIAL PRIMARY KEY,
        "runoff_election_id" INTEGER NOT NULL REFERENCES "RunoffElection"("id") ON DELETE CASCADE,
        "candidate_id" INTEGER NOT NULL REFERENCES "Candidate"("id"),
        "candidate_name" VARCHAR(100) NOT NULL,
        "original_vote_count" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for runoff candidates
    CREATE INDEX IF NOT EXISTS idx_runoff_candidate_election ON "RunoffCandidate"("runoff_election_id");
    CREATE INDEX IF NOT EXISTS idx_runoff_candidate_candidate ON "RunoffCandidate"("candidate_id");

    -- Runoff votes table
    CREATE TABLE IF NOT EXISTS "RunoffVote" (
        "id" SERIAL PRIMARY KEY,
        "runoff_election_id" INTEGER NOT NULL REFERENCES "RunoffElection"("id") ON DELETE CASCADE,
        "voucher" VARCHAR(8) NOT NULL REFERENCES "User"("voucher"),
        "candidate_id" INTEGER NOT NULL,
        "verification_code" VARCHAR(50) NOT NULL,
        "voted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_runoff_candidate
            FOREIGN KEY (candidate_id)
            REFERENCES "Candidate"("id")
            ON DELETE CASCADE
    );

    -- Create indexes for runoff votes
    CREATE INDEX IF NOT EXISTS idx_runoff_vote_election ON "RunoffVote"("runoff_election_id");
    CREATE INDEX IF NOT EXISTS idx_runoff_vote_voucher ON "RunoffVote"("voucher");
    CREATE INDEX IF NOT EXISTS idx_runoff_vote_candidate ON "RunoffVote"("candidate_id");
    CREATE INDEX IF NOT EXISTS idx_runoff_vote_verification ON "RunoffVote"("verification_code");

    -- Insert default election status if not exists
    INSERT INTO "ElectionStatus" ("status", "settings")
    SELECT 'not_started', '{"allowVoting": false, "showResults": false, "requireVerification": true}'
    WHERE NOT EXISTS (SELECT 1 FROM "ElectionStatus");

    -- Create indexes for election status
    CREATE INDEX IF NOT EXISTS idx_election_status_status ON "ElectionStatus"("status");
    CREATE INDEX IF NOT EXISTS idx_election_status_created_at ON "ElectionStatus"("created_at");

    -- Create indexes for runoff elections
    CREATE INDEX IF NOT EXISTS idx_runoff_election_status ON "RunoffElection"("status");
    CREATE INDEX IF NOT EXISTS idx_runoff_election_position ON "RunoffElection"("original_position_id");
    CREATE INDEX IF NOT EXISTS idx_runoff_election_created_at ON "RunoffElection"("created_at");
    """

    try:
        print("Adding election management tables...")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Execute the migration
        cur.execute(migration_sql)
        conn.commit()

        print("Election management tables added successfully!")

        # Verify the tables were created
        tables_to_check = [
            "ElectionStatus",
            "RunoffElection",
            "RunoffCandidate",
            "RunoffVote"
        ]

        print("\nVerifying created tables:")
        for table in tables_to_check:
            cur.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_name = %s
            """, [table])

            if cur.fetchone():
                print(f"  {table} table created")

                # Show table structure
                cur.execute("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = %s
                    ORDER BY ordinal_position
                """, [table])

                columns = cur.fetchall()
                print(f"     Columns: {len(columns)}")
                for col in columns[:3]:  # Show first 3 columns
                    print(f"       - {col[0]}: {col[1]}")
                if len(columns) > 3:
                    print(f"       ... and {len(columns) - 3} more columns")
            else:
                print(f"  {table} table not found")

        # Confirm connection
        cur.execute("SELECT version()")
        version = cur.fetchone()[0]
        print(f"\nConnected to: {version}")

        print(f"\nMigration completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

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