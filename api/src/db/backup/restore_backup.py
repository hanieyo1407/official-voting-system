#!/usr/bin/env python3
"""
Restore database from backup file
Author: System
Date: 2025-10-19

This script restores the database from a backup file.
WARNING: This will overwrite existing data!
"""

import subprocess
import sys
import os
from datetime import datetime

def list_available_backups():
    """List all available backup files"""
    backup_dir = "src/db/backup/files"

    if not os.path.exists(backup_dir):
        print("❌ No backup directory found!")
        return []

    backup_files = [f for f in os.listdir(backup_dir) if f.endswith('.gz')]
    backup_files.sort(reverse=True)  # Most recent first

    if not backup_files:
        print("❌ No backup files found!")
        return []

    print("📋 Available backup files:")
    for i, file in enumerate(backup_files, 1):
        file_path = os.path.join(backup_dir, file)
        file_size = os.path.getsize(file_path)
        file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
        print(f"  {i}. {file} ({file_size} bytes, {file_time.strftime('%Y-%m-%d %H:%M')})")

    return backup_files

def restore_from_backup(backup_file):
    """Restore database from specified backup file"""
    try:
        db_url = "postgresql://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require"

        print(f"🔄 Restoring from backup: {backup_file}")
        print("⚠️ WARNING: This will overwrite existing data!")
        print("Press Ctrl+C within 5 seconds to cancel...")

        # Wait 5 seconds for potential cancellation
        import time
        time.sleep(5)

        # Decompress backup file if needed
        if backup_file.endswith('.gz'):
            decompressed_file = backup_file.replace('.gz', '')
            print(f"📦 Decompressing {backup_file}...")

            with open(decompressed_file, 'wb') as outfile:
                import gzip
                with gzip.open(backup_file, 'rb') as infile:
                    outfile.write(infile.read())

            backup_file = decompressed_file

        # Restore database
        cmd = [
            "psql",
            db_url,
            "--no-password",
            "-f", backup_file
        ]

        print("🔄 Executing restore...")
        result = subprocess.run(cmd, capture_output=True, text=True, env={
            **os.environ,
            "PGPASSWORD": "AVNS_4NMugWcbAOIjkUAmCn7"
        })

        if result.returncode == 0:
            print("✅ Database restored successfully!")
            print(result.stdout)
        else:
            print(f"❌ Restore failed: {result.stderr}")
            return False

        # Clean up decompressed file if we created one
        if backup_file.endswith('.sql') and backup_file != backup_file:  # If we decompressed
            try:
                os.remove(backup_file)
                print(f"🗑️ Cleaned up temporary file: {backup_file}")
            except:
                pass

        return True

    except KeyboardInterrupt:
        print("\n⚠️ Restore cancelled by user")
        return False
    except Exception as e:
        print(f"❌ Restore error: {e}")
        return False

def verify_restore():
    """Verify that the restore was successful"""
    try:
        print("🔍 Verifying restore...")

        # Check if we can connect to database
        cmd = [
            "psql",
            "postgresql://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require",
            "--no-password",
            "--command", "SELECT COUNT(*) as users FROM \"User\";"
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, env={
            **os.environ,
            "PGPASSWORD": "AVNS_4NMugWcbAOIjkUAmCn7"
        })

        if result.returncode == 0:
            print("✅ Database connection verified")
            print(f"Query result: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ Database verification failed: {result.stderr}")
            return False

    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

def main():
    print("🚨 DATABASE RESTORE UTILITY")
    print("⚠️ WARNING: This will overwrite existing data!")

    # List available backups
    backup_files = list_available_backups()

    if not backup_files:
        print("❌ No backup files available for restore")
        sys.exit(1)

    # Get user selection
    try:
        selection = input("\nEnter backup number to restore (or 'q' to quit): ").strip()

        if selection.lower() == 'q':
            print("Restore cancelled")
            sys.exit(0)

        backup_index = int(selection) - 1

        if 0 <= backup_index < len(backup_files):
            selected_backup = os.path.join("src/db/backup/files", backup_files[backup_index])
            print(f"Selected: {backup_files[backup_index]}")

            # Confirm restore
            confirm = input("Are you sure you want to restore this backup? (yes/no): ").strip().lower()
            if confirm == 'yes':
                # Perform restore
                restore_success = restore_from_backup(selected_backup)

                if restore_success:
                    # Verify restore
                    verify_success = verify_restore()
                    if verify_success:
                        print("🎉 Restore completed and verified successfully!")
                        sys.exit(0)
                    else:
                        print("⚠️ Restore completed but verification failed")
                        sys.exit(1)
                else:
                    print("❌ Restore failed!")
                    sys.exit(1)
            else:
                print("Restore cancelled")
                sys.exit(0)
        else:
            print("❌ Invalid selection")
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n⚠️ Operation cancelled")
        sys.exit(0)
    except ValueError:
        print("❌ Please enter a valid number")
        sys.exit(1)

if __name__ == "__main__":
    main()