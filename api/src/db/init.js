const MigrationRunner = require('./migration-runner');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to database...');

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL environment variable is required');
      process.exit(1);
    }

    const runner = new MigrationRunner(databaseUrl);

    // Test connection
    await runner.pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    // Run all migrations
    console.log('🚀 Running database migrations...');
    await runner.migrate();

    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('📋 Default Super Admin Credentials:');
    console.log('   Username: superadmin');
    console.log('   Email: admin@sjbu-voting.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password immediately after first login!');
    console.log('');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };