# 🗄️ Database Backup Strategy for SJBU Voting System

## Overview

This document outlines the backup strategy for your PostgreSQL database hosted on Aiven Cloud. Data integrity is crucial for a voting system, so proper backup procedures are essential.

## 🏗️ Current Setup

- **Database**: PostgreSQL on Aiven Cloud
- **Location**: Remote cloud hosting
- **Critical Data**: Votes, Users, Candidates, Positions, Audit logs
- **Backup Responsibility**: Shared between Aiven (infrastructure) and you (application data)

## 📋 Aiven's Built-in Backup Features

### Automatic Backups
Aiven automatically provides:
- **Daily backups** (retention: 30 days)
- **Point-in-time recovery** (within backup window)
- **Automated failover** capabilities
- **Encrypted backups** (at rest and in transit)

### Accessing Aiven Backups
```bash
# Aiven provides backup access through their dashboard
1. Log into Aiven Console
2. Navigate to your PostgreSQL service
3. Go to "Backups" tab
4. Download specific backup files
```

## 🛠️ Manual Backup Strategies

### 1. SQL Dump Backup (Recommended)

Create a script for regular SQL dumps:

```bash
#!/bin/bash
# save as: backup-database.sh

DB_URL="postgres://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create full database backup
pg_dump "$DB_URL" > "$BACKUP_DIR/voting_backup_$DATE.sql"

# Create compressed backup
gzip "$BACKUP_DIR/voting_backup_$DATE.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "voting_backup_*.gz" -type f -mtime +7 -delete

echo "Backup completed: voting_backup_$DATE.sql.gz"
```

### 2. Automated Backup Script

```python
# save as: automated_backup.py
#!/usr/bin/env python3
import subprocess
import sys
from datetime import datetime
import os

def create_backup():
    try:
        # Database connection string
        db_url = "postgresql://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require"

        # Create backup filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = f"backups/voting_backup_{timestamp}.sql"

        # Ensure backups directory exists
        os.makedirs("backups", exist_ok=True)

        print(f"Creating backup: {backup_file}")

        # Use pg_dump to create backup
        cmd = [
            "pg_dump",
            db_url,
            "--no-password",  # Uses environment variables
            "--clean",        # Include DROP statements
            "--if-exists",    # Use IF EXISTS for DROP
            "-f", backup_file
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)

        if result.returncode == 0:
            print(f"✅ Backup created successfully: {backup_file}")

            # Compress the backup
            gzip_cmd = ["gzip", backup_file]
            gzip_result = subprocess.run(gzip_cmd, capture_output=True)

            if gzip_result.returncode == 0:
                print(f"✅ Backup compressed: {backup_file}.gz")
            else:
                print(f"⚠️ Backup created but compression failed: {result.stderr}")

        else:
            print(f"❌ Backup failed: {result.stderr}")
            return False

        return True

    except Exception as e:
        print(f"❌ Backup error: {e}")
        return False

if __name__ == "__main__":
    success = create_backup()
    sys.exit(0 if success else 1)
```

## ⏰ Automated Backup Schedule

### Using Cron Jobs (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/your/project/src/db/backup/automated_backup.py

# Add weekly full backup on Sundays at 3 AM
0 3 * * 0 /path/to/your/project/src/db/backup/full_backup.sh
```

### Using Windows Task Scheduler

1. **Open Task Scheduler**
2. **Create Basic Task**
3. **Set trigger**: Daily at 2:00 AM
4. **Action**: Start a program
5. **Program**: `python` or `python3`
6. **Arguments**: `/path/to/automated_backup.py`

## 🔄 Backup Restoration

### Restore from Aiven Backup

1. **Via Aiven Console**:
   - Go to your PostgreSQL service
   - Navigate to "Backups" tab
   - Select backup point
   - Click "Restore" or "Fork service"

2. **Via pg_restore**:
```bash
# Restore from SQL dump
pg_restore -d "your_connection_string" voting_backup_20231019.sql

# Restore specific tables only
pg_restore -d "your_connection_string" -t Vote -t Candidate voting_backup_20231019.sql
```

## 📊 Backup Verification

### Verify Backup Integrity

```sql
-- Check table counts after restore
SELECT
  'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT
  'Votes' as table_name, COUNT(*) as count FROM "Vote"
UNION ALL
SELECT
  'Candidates' as table_name, COUNT(*) as count FROM "Candidate"
UNION ALL
SELECT
  'Positions' as table_name, COUNT(*) as count FROM "Position";
```

### Test Restoration Process

1. **Create test database**
2. **Restore backup to test database**
3. **Verify all data integrity**
4. **Test application functionality**

## 🚨 Emergency Backup Procedures

### If Database is Corrupted

1. **Immediate Action**:
   ```bash
   # Create emergency backup of current state
   pg_dump "your_db_url" > emergency_backup_$(date +%s).sql
   ```

2. **Restore from Latest Aiven Backup**:
   - Use Aiven Console to restore to point-in-time
   - Or restore from your latest manual backup

3. **Verify Data Integrity**:
   - Check vote counts
   - Verify user registrations
   - Confirm candidate information

## 📁 Backup Storage Strategy

### Local Storage
- **Daily backups**: Keep 7 days locally
- **Weekly backups**: Keep 4 weeks locally
- **Monthly backups**: Keep 12 months locally

### Cloud Storage (Recommended)
```bash
# Upload to cloud storage (example with AWS S3)
aws s3 cp voting_backup_20231019.sql.gz s3://your-bucket/voting-backups/

# Or use Google Cloud Storage, Azure Blob, etc.
```

## 🔒 Security Considerations

### Backup Security
- **Encrypt backups** before cloud storage
- **Use strong passwords** in connection strings
- **Limit backup access** to authorized personnel only

### Access Control
- **Separate backup credentials** from production
- **Regular credential rotation**
- **Audit backup access logs**

## 📈 Monitoring and Alerts

### Backup Monitoring Script

```python
#!/usr/bin/env python3
# save as: monitor_backups.py

import os
import sys
from datetime import datetime, timedelta

def check_backups():
    backup_dir = "./backups"

    if not os.path.exists(backup_dir):
        print("❌ No backup directory found!")
        return False

    # Check for recent backups
    recent_backups = []
    for file in os.listdir(backup_dir):
        if file.endswith('.gz'):
            file_path = os.path.join(backup_dir, file)
            file_age = datetime.now() - datetime.fromtimestamp(os.path.getmtime(file_path))

            if file_age < timedelta(hours=25):  # Within last 25 hours
                recent_backups.append(file)

    if len(recent_backups) == 0:
        print("❌ No recent backups found!")
        return False

    print(f"✅ Found {len(recent_backups)} recent backups:")
    for backup in recent_backups:
        print(f"   - {backup}")

    return True

if __name__ == "__main__":
    success = check_backups()
    sys.exit(0 if success else 1)
```

## 🎯 Best Practices Summary

1. **Automate Everything**: Use scripts for regular backups
2. **Test Restorations**: Regularly verify backups work
3. **Multiple Storage Locations**: Don't rely on single storage
4. **Monitor Backup Health**: Automated checks and alerts
5. **Document Procedures**: Clear instructions for emergencies
6. **Regular Testing**: Practice restore procedures

## 🚨 Emergency Contacts

- **Aiven Support**: For cloud infrastructure issues
- **Database Admin**: For backup restoration assistance
- **Development Team**: For application-specific recovery

---

**Remember**: In a voting system, backup integrity is as important as the election results themselves! 🗳️