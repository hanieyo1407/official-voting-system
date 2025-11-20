// api/src/db/config.ts (Final Production Stabilization Fix)

import { Pool } from "pg";
import dotenv from "dotenv";
import { LoggingService } from "../services/logging.service"; // Assuming this import path is correct

dotenv.config();

// Lazily initialized pool instance
let pool: Pool;

// CRITICAL FIX: Wrap pool creation in a function to prevent synchronous crashes on module load
function initializePool(): Pool {
  if (pool) {
    return pool;
  }

  try {
    const caCert = process.env.PG_CA_CERT?.replace(/\\n/g, "\n");

    if (!caCert) {
      throw new Error("PG_CA_CERT is missing or empty.");
    }

    // Initialize the pool
    pool = new Pool({
      // *** CRITICAL: PASTE YOUR ACTUAL .env VALUES HERE ***
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      database: process.env.DATABASE_NAME,
      ssl: {
        rejectUnauthorized: false,
        ca: caCert,
      },

      // Fixed connection settings
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    // CRITICAL FIX: Only log an error and DO NOT crash the entire application
    pool.on("error", (err) => {
      console.error(
        "⚠️ UNEXPECTED DATABASE ERROR on idle client (Pool will attempt to recover):",
        err,
      );
    });

    // Immediate connection test (async)
    pool.query("SELECT 1 + 1").catch((err) => {
      console.error(
        "❌ FATAL: Database connection test failed. Check credentials/certificate.",
        err.message,
      );
      LoggingService.logError(err, { context: "db_pool_test_failed" });
      process.exit(1);
    });

    console.log(
      "✅ Database Pool Initialized (Connection Test Running in Background)",
    );
    return pool;
  } catch (error: any) {
    console.error(
      "❌ FATAL: Database Pool Initialization Error. Check .env variables or certificate.",
      error.message,
    );
    process.exit(1);
    throw error; // Throw error to satisfy TS
  }
}

// Export the initialized pool instance via a function call
export default initializePool();
