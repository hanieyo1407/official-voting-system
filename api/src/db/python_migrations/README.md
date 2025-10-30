# Python Database Migration System

This directory contains Python-based database migration scripts for the SJBU Voting System, designed to work with your existing PostgreSQL database setup.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

Make sure your `.env` file contains:
```env
DATABASE_URL="postgresql://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require"
PG_CA_CERT="-----BEGIN CERTIFICATE-----..."
JWT_SECRET="your-secret"
```

### 3. Run Migrations

```bash
# Run all pending migrations
python migrate.py

# Rollback last migration (development only)
python migrate.py rollback
```

## 📁 File Structure

```
python_migrations/
├── migrate.py              # Main migration runner
├── 001_initial_schema.sql  # Initial database schema
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🔧 Features

### SSL Certificate Handling
The migration system automatically handles Aiven Cloud's self-signed certificates:

1. **Primary Method**: Uses your `PG_CA_CERT` environment variable
2. **Fallback Method**: Uses `sslmode=no-verify` if certificate validation fails
3. **Connection Timeout**: 10-second timeout for connection attempts

### Migration Tracking
- **Automatic Tracking**: Records which migrations have been executed
- **Transaction Safety**: Rolls back on errors
- **Duplicate Prevention**: Won't run the same migration twice
- **Rollback Support**: Can rollback last migration for development

### Error Handling
- **Detailed Error Messages**: Shows exactly what went wrong
- **Connection Debugging**: Displays SSL configuration being used
- **Graceful Fallbacks**: Tries alternative SSL configurations if needed

## 📋 Migration Files

### Adding New Migrations

1. Create a new SQL file: `002_your_migration_name.sql`
2. Add your SQL changes to the file
3. Run: `python migrate.py`

The system will automatically:
- Detect the new migration file
- Check if it has been run before
- Execute it if it's pending
- Record it as completed

### Migration File Naming Convention

```
NNN_description.sql
```

Where:
- `NNN` = Sequential number (001, 002, 003, etc.)
- `description` = Brief description of changes

## 🔍 Debugging

### Verbose Output
The migration script shows:
- ✅ Environment variables loaded
- 🔧 SSL configuration method
- 🚀 Migration progress
- ✅ Migration completion status

### Common Issues

**SSL Certificate Error:**
```bash
# If you get SSL errors, the script will automatically try:
# 1. Using your PG_CA_CERT
# 2. Fallback to sslmode=no-verify
```

**Connection Timeout:**
- Check your internet connection
- Verify DATABASE_URL is correct
- Ensure Aiven Cloud database is accessible

**Permission Errors:**
- Verify database credentials in DATABASE_URL
- Check if your IP is whitelisted in Aiven Cloud

## 🛠️ Advanced Usage

### Manual Migration Execution

```python
from migrate import DatabaseMigrator

# Create migrator instance
migrator = DatabaseMigrator()

# Run all migrations
migrator.migrate()

# Or rollback last migration
migrator.rollback()
```

### Custom Migration Logic

You can extend the `DatabaseMigrator` class for custom migration logic:

```python
class CustomMigrator(DatabaseMigrator):
    def before_migration(self, migration_name):
        # Custom pre-migration logic
        pass

    def after_migration(self, migration_name):
        # Custom post-migration logic
        pass
```

## 📊 Migration Status

### Check Executed Migrations

Connect to your database and query:
```sql
SELECT migration_name, executed_at
FROM schema_migrations
ORDER BY executed_at DESC;
```

### Migration Files Status

The system automatically tracks:
- Which migration files exist
- Which have been executed
- When they were executed
- Execution order

## 🔒 Security Notes

- **Environment Variables**: Never commit `.env` files with real credentials
- **SSL Certificates**: Keep `PG_CA_CERT` secure and don't expose it
- **Database Credentials**: Use strong passwords and rotate regularly
- **Network Security**: Ensure only authorized IPs can access your database

## 🚀 Production Deployment

For production use:

1. **Set up proper SSL certificates** (not self-signed if possible)
2. **Use strong database credentials**
3. **Enable database audit logging**
4. **Monitor migration execution**
5. **Backup database before running migrations**

## 📞 Support

If you encounter issues:

1. Check the error messages - they include specific details
2. Verify your `.env` file has all required variables
3. Ensure your Aiven Cloud database is running and accessible
4. Check that your IP is whitelisted in Aiven Cloud console

The migration system is designed to be robust and provide clear feedback about what's happening at each step.