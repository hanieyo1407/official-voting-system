import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  const caCert = process.env.PG_CA_CERT?.replace(/\\n/g, "\n");

  if (!caCert) {
    console.error("PG_CA_CERT is missing or empty.");
    process.exit(1);
  }

  const pool = new Pool({
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    ssl: {
      rejectUnauthorized: false,
      ca: caCert,
    },
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log("✅ Database connection successful!");
    await client.query("SELECT NOW()");
    client.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  } finally {
    await pool.end();
  }
}

testConnection();