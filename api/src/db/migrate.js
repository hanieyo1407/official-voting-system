#!/usr/bin/env node

/**
 * CLI script for running database migrations
 * Usage:
 *   node src/db/migrate.js          # Run all pending migrations
 *   node src/db/migrate.js rollback # Rollback last migration
 */

const MigrationRunner = require('./migration-runner');
require('dotenv').config();

async function main() {
    const command = process.argv[2] || 'migrate';

    // Load environment variables
    require('dotenv').config();

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL environment variable is required');
        process.exit(1);
    }

    console.log('🔧 Database URL loaded:', databaseUrl ? '✅' : '❌');
    console.log('🔧 PG_CA_CERT loaded:', process.env.PG_CA_CERT ? '✅' : '❌');

    const runner = new MigrationRunner(databaseUrl);

    try {
        if (command === 'migrate') {
            await runner.migrate();
        } else if (command === 'rollback') {
            await runner.rollback();
        } else {
            console.error('❌ Unknown command. Use "migrate" or "rollback"');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Migration error:', error.message);
        process.exit(1);
    } finally {
        await runner.close();
    }
}

main();