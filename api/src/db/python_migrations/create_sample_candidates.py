#!/usr/bin/env python3
"""
Create sample candidates for President and Vice President positions
Author: System
Date: 2025-10-19

This script creates sample candidates for testing the voting system.
"""

import psycopg2
import sys
from datetime import datetime

def main():
    # Database connection
    DATABASE_URL = 'postgres://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require'

    try:
        print("Creating sample candidates for President and Vice President...")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Get position IDs
        cur.execute('SELECT id, position_name FROM "Position" WHERE position_name IN (\'President\', \'Vice President\')')
        positions = cur.fetchall()

        if len(positions) != 2:
            print("Error: President and Vice President positions not found!")
            return

        president_id = positions[0][0] if positions[0][1] == 'President' else positions[1][0]
        vice_president_id = positions[1][0] if positions[1][1] == 'Vice President' else positions[0][0]

        print(f"President Position ID: {president_id}")
        print(f"Vice President Position ID: {vice_president_id}")

        # Create sample President candidates
        print("\nCreating President candidates...")
        president_candidates = [
            ('Alice Johnson', 'Experienced leader focused on student welfare and academic excellence.'),
            ('Bob Smith', 'Tech-savvy innovator dedicated to modernizing club operations.'),
            ('Carol Williams', 'Community organizer with strong communication skills.')
        ]

        for name, manifesto in president_candidates:
            cur.execute(
                'INSERT INTO "Candidate" (name, position_id, manifesto) VALUES (%s, %s, %s) RETURNING id, name',
                (name, president_id, manifesto)
            )
            candidate = cur.fetchone()
            print(f"  Created President candidate: {candidate[1]} (ID: {candidate[0]})")

        # Create sample Vice President candidates
        print("\nCreating Vice President candidates...")
        vice_president_candidates = [
            ('David Brown', 'Detail-oriented organizer with project management expertise.'),
            ('Emma Davis', 'Creative thinker focused on event planning and member engagement.'),
            ('Frank Wilson', 'Analytical problem-solver with financial management skills.')
        ]

        for name, manifesto in vice_president_candidates:
            cur.execute(
                'INSERT INTO "Candidate" (name, position_id, manifesto) VALUES (%s, %s, %s) RETURNING id, name',
                (name, vice_president_id, manifesto)
            )
            candidate = cur.fetchone()
            print(f"  Created Vice President candidate: {candidate[1]} (ID: {candidate[0]})")

        conn.commit()

        # Show all candidates
        print("\nAll candidates created:")
        cur.execute('SELECT c.id, c.name, p.position_name FROM "Candidate" c JOIN "Position" p ON c.position_id = p.id ORDER BY p.id, c.id')
        all_candidates = cur.fetchall()

        for candidate in all_candidates:
            print(f"  ID {candidate[0]}: {candidate[1]} ({candidate[2]})")

        print(f"\nSetup completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

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