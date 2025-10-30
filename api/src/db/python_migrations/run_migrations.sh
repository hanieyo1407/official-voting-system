#!/bin/bash

# Database Migration Runner Script
# Makes it easy to run Python migrations from any directory

echo "🚀 SJBU Voting System - Python Database Migrations"
echo "================================================="

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if we're in the right directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATION_DIR="$SCRIPT_DIR"

if [ ! -f "$MIGRATION_DIR/migrate.py" ]; then
    echo "❌ Migration script not found in $MIGRATION_DIR"
    exit 1
fi

# Check if requirements are installed
if ! python3 -c "import psycopg2" &> /dev/null; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r "$MIGRATION_DIR/requirements.txt"

    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Python dependencies"
        exit 1
    fi
fi

# Check for .env file
ENV_FILE="$(dirname "$SCRIPT_DIR")/../.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Warning: .env file not found at $ENV_FILE"
    echo "   Make sure DATABASE_URL and PG_CA_CERT are set in your environment"
fi

echo "🔧 Environment check complete"
echo "📍 Migration directory: $MIGRATION_DIR"

# Change to migration directory and run migrations
cd "$MIGRATION_DIR"

if [ "$1" = "rollback" ]; then
    echo "🔄 Running migration rollback..."
    python3 migrate.py rollback
else
    echo "🚀 Running database migrations..."
    python3 migrate.py
fi

echo "✅ Migration script completed"