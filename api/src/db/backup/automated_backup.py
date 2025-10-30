#!/usr/bin/env python3
"""
Automated backup script for SJBU Voting System
Author: System
Date: 2025-10-19

This script creates regular backups of the PostgreSQL database.
"""

import subprocess
import sys
import os
from datetime import datetime

def create_backup():
    """Create a full database backup"""
    try:
        # Database connection details
        db_url = "postgresql://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require"

        # Create backup filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = f"src/db/backup/files/voting_backup_{timestamp}.sql"

        # Ensure backup directory exists
        os.makedirs("src/db/backup/files", exist_ok=True)

        print(f"🔄 Creating backup: {backup_file}")

        # Use pg_dump to create backup
        cmd = [
            "pg_dump",
            db_url,
            "--no-password",  # Uses environment variables for auth
            "--clean",        # Include DROP statements for clean restore
            "--if-exists",    # Use IF EXISTS for DROP statements
            "--verbose",      # Show progress
            "-f", backup_file
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, env={
            **os.environ,
            "PGPASSWORD": "AVNS_4NMugWcbAOIjkUAmCn7"  # Database password
        })

        if result.returncode == 0:
            print(f"✅ Backup created successfully: {backup_file}")

            # Compress the backup file
            gzip_cmd = ["gzip", backup_file]
            gzip_result = subprocess.run(gzip_cmd, capture_output=True)

            if gzip_result.returncode == 0:
                compressed_file = f"{backup_file}.gz"
                print(f"✅ Backup compressed: {compressed_file}")

                # Clean up old backups (keep last 7 days)
                cleanup_old_backups()
                return True
            else:
                print(f"⚠️ Backup created but compression failed: {result.stderr}")
                return True

        else:
            print(f"❌ Backup failed: {result.stderr}")
            return False

    except Exception as e:
        print(f"❌ Backup error: {e}")
        return False

def cleanup_old_backups():
    """Remove backup files older than 7 days"""
    try:
        backup_dir = "src/db/backup/files"
        if not os.path.exists(backup_dir):
            return

        cutoff_date = datetime.now().timestamp() - (7 * 24 * 60 * 60)  # 7 days ago

        for file in os.listdir(backup_dir):
            if file.endswith('.gz'):
                file_path = os.path.join(backup_dir, file)
                file_mtime = os.path.getmtime(file_path)

                if file_mtime < cutoff_date:
                    os.remove(file_path)
                    print(f"🗑️ Removed old backup: {file}")

    except Exception as e:
        print(f"⚠️ Cleanup warning: {e}")

def verify_backup():
    """Verify the most recent backup file exists and is valid"""
    try:
        backup_dir = "src/db/backup/files"

        # Find most recent backup
        if not os.path.exists(backup_dir):
            print("❌ No backup directory found")
            return False

        backup_files = [f for f in os.listdir(backup_dir) if f.endswith('.gz')]
        if not backup_files:
            print("❌ No backup files found")
            return False

        # Get most recent backup
        most_recent = max(backup_files, key=lambda f: os.path.getmtime(os.path.join(backup_dir, f)))
        most_recent_path = os.path.join(backup_dir, most_recent)

        # Check file size (should be > 0)
        file_size = os.path.getsize(most_recent_path)
        if file_size == 0:
            print("❌ Backup file is empty")
            return False

        print(f"✅ Most recent backup verified: {most_recent} ({file_size} bytes)")
        return True

    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting automated backup process...")

    # Create backup
    backup_success = create_backup()

    # Verify backup
    if backup_success:
        verify_success = verify_backup()
        if verify_success:
            print("🎉 Backup process completed successfully!")
            sys.exit(0)
        else:
            print("⚠️ Backup created but verification failed")
            sys.exit(1)
    else:
        print("❌ Backup process failed!")
        sys.exit(1)