#!/usr/bin/env python3
"""
Verify that all migrations have been applied correctly
Author: System
Date: 2025-10-19

This script checks if all database changes have been applied correctly.
"""

import psycopg2
import sys
from datetime import datetime

def main():
    # Database connection
    DATABASE_URL = 'postgres://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require'

    try:
        print("Verifying database migrations...")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Check 1: Verify User table has created_at column
        print("\n1. Checking User table structure...")
        cur.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'User' AND column_name = 'created_at'
        """)

        user_created_at = cur.fetchone()
        if user_created_at:
            print(f"   User.created_at column exists: {user_created_at[1]}")
        else:
            print("   User.created_at column missing!")

        # Check 2: Verify Position table contents
        print("\n2. Checking Position table contents...")
        cur.execute('SELECT id, position_name FROM "Position" ORDER BY id')
        positions = cur.fetchall()

        print(f"   Found {len(positions)} positions:")
        for position in positions:
            print(f"     - ID {position[0]}: '{position[1]}'")

        # Check if President and Vice President exist
        president_exists = any(pos[1] == 'President' for pos in positions)
        vice_president_exists = any(pos[1] == 'Vice President' for pos in positions)

        if president_exists and vice_president_exists:
            print("   President and Vice President positions exist!")
        else:
            print("   President or Vice President positions missing!")

        # Check 3: Verify Vote table structure
        print("\n3. Checking Vote table structure...")
        cur.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'Vote'
        """)

        vote_columns = cur.fetchall()
        print(f"   Vote table has {len(vote_columns)} columns:")
        for col in vote_columns:
            print(f"     - {col[0]}: {col[1]} (nullable: {col[2]})")

        # Check 4: Check for existing votes
        print("\n4. Checking existing votes...")
        cur.execute('SELECT COUNT(*) as count FROM "Vote"')
        vote_count = cur.fetchone()[0]
        print(f"   Total votes in system: {vote_count}")

        if vote_count > 0:
            cur.execute('SELECT voucher, candidate_id, position_id, verification_code FROM "Vote" LIMIT 3')
            sample_votes = cur.fetchall()
            print("   Sample votes:")
            for vote in sample_votes:
                print(f"     - Voucher: {vote[0]}, Candidate: {vote[1]}, Position: {vote[2]}, Code: {vote[3]}")

        # Check 5: Verify User table row count
        print("\n5. Checking User table...")
        cur.execute('SELECT COUNT(*) as count FROM "User"')
        user_count = cur.fetchone()[0]
        print(f"   Total users in system: {user_count}")

        # Confirm connection
        cur.execute("SELECT version()")
        version = cur.fetchone()[0]
        print(f"\nConnected to: {version}")

        print(f"\nVerification completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    except Exception as e:
        print(f"Verification failed: {e}")
        sys.exit(1)

    finally:
        if 'cur' in locals() and 'conn' in locals():
            cur.close()
            conn.close()
            print("Connection closed.")

if __name__ == "__main__":
    main()