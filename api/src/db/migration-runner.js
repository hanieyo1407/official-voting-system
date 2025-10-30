const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

/**
 * Database Migration Runner
 * Handles running SQL migrations in order with proper tracking
 */
class MigrationRunner {
    constructor(connectionString) {
        this.connectionString = connectionString;

        // For Aiven Cloud, modify connection string to handle SSL properly
        let modifiedConnectionString = connectionString;

        // If connection string has sslmode=require, modify it to work with self-signed certs
        if (connectionString.includes('sslmode=require')) {
            // Replace sslmode=require with sslmode=no-verify for self-signed certificates
            modifiedConnectionString = connectionString.replace('sslmode=require', 'sslmode=no-verify');
            console.log('🔧 Modified connection string for self-signed certificate');
            console.log('🔧 Original:', connectionString);
            console.log('🔧 Modified:', modifiedConnectionString);
        }

        // Create pool with modified connection string
        this.pool = new Pool({
            connectionString: modifiedConnectionString,
            ssl: { rejectUnauthorized: false }
        });

        this.migrationsTable = 'schema_migrations';
    }

    /**
     * Initialize the migration system by creating the migrations tracking table
     */
    async initialize() {
        const createMigrationsTable = `
            CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_migration_name ON ${this.migrationsTable}(migration_name);
        `;

        await this.pool.query(createMigrationsTable);
        console.log('✅ Migration system initialized');
    }

    /**
     * Get list of already executed migrations
     */
    async getExecutedMigrations() {
        const result = await this.pool.query(
            `SELECT migration_name FROM ${this.migrationsTable} ORDER BY migration_name`
        );
        return result.rows.map(row => row.migration_name);
    }

    /**
     * Record a migration as executed
     */
    async recordMigration(migrationName) {
        await this.pool.query(
            `INSERT INTO ${this.migrationsTable} (migration_name) VALUES ($1)`,
            [migrationName]
        );
    }

    /**
     * Get all available migration files
     */
    async getAvailableMigrations() {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        return files
            .filter(file => file.endsWith('.sql'))
            .sort();
    }

    /**
     * Run a single migration
     */
    async runMigration(migrationName) {
        const migrationPath = path.join(__dirname, 'migrations', migrationName);
        const sql = await fs.readFile(migrationPath, 'utf8');

        console.log(`🔄 Running migration: ${migrationName}`);

        // Split SQL into individual statements
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        // Execute each statement in a transaction
        await this.pool.query('BEGIN');

        try {
            for (const statement of statements) {
                if (statement.trim()) {
                    await this.pool.query(statement);
                }
            }

            // Record the migration as executed
            await this.recordMigration(migrationName);

            await this.pool.query('COMMIT');
            console.log(`✅ Migration completed: ${migrationName}`);

        } catch (error) {
            await this.pool.query('ROLLBACK');
            console.error(`❌ Migration failed: ${migrationName}`);
            console.error('Error:', error.message);
            throw error;
        }
    }

    /**
     * Run all pending migrations
     */
    async migrate() {
        console.log('🚀 Starting database migrations...');

        // Initialize migration system if needed
        await this.initialize();

        // Get executed and available migrations
        const executedMigrations = await this.getExecutedMigrations();
        const availableMigrations = await this.getAvailableMigrations();

        // Find pending migrations
        const pendingMigrations = availableMigrations.filter(
            migration => !executedMigrations.includes(migration)
        );

        if (pendingMigrations.length === 0) {
            console.log('✅ No pending migrations');
            return;
        }

        console.log(`📋 Found ${pendingMigrations.length} pending migrations`);

        // Run each pending migration
        for (const migration of pendingMigrations) {
            await this.runMigration(migration);
        }

        console.log('🎉 All migrations completed successfully!');
    }

    /**
     * Rollback the last migration (for development)
     */
    async rollback() {
        const executedMigrations = await this.getExecutedMigrations();

        if (executedMigrations.length === 0) {
            console.log('❌ No migrations to rollback');
            return;
        }

        const lastMigration = executedMigrations[executedMigrations.length - 1];
        console.log(`🔄 Rolling back migration: ${lastMigration}`);

        // For now, we'll just remove the record
        // In a production system, you'd want proper rollback SQL files
        await this.pool.query(
            `DELETE FROM ${this.migrationsTable} WHERE migration_name = $1`,
            [lastMigration]
        );

        console.log(`✅ Rolled back migration: ${lastMigration}`);
    }

    /**
     * Close the database connection
     */
    async close() {
        await this.pool.end();
    }
}

module.exports = MigrationRunner;