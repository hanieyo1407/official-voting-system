#!/usr/bin/env python3
"""
Simple Database Migration Script for SJBU Voting System
Author: Anthony Phiri
Date: 2025-10-18

This script connects to your PostgreSQL database (Aiven Cloud)
and applies the initial schema for the SJBU Voting System.
"""

import psycopg2
import sys

def main():
    # --- Database connection ---
    DATABASE_URL = 'postgres://avnadmin:AVNS_4NMugWcbAOIjkUAmCn7@sjbu-v-anthonyphiri533-0f2d.d.aivencloud.com:24897/defaultdb?sslmode=require'

    # --- SQL schema migration ---
    create_tables_sql = """
    -- Initial database schema for SJBU Voting System
    -- Migration: 001_initial_schema
    -- Created: 2025-10-17

    CREATE TABLE IF NOT EXISTS "AdminUser" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(50) UNIQUE NOT NULL,
        "email" VARCHAR(100) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255) NOT NULL,
        "role" VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
        "is_active" BOOLEAN DEFAULT true,
        "last_login" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_admin_user_email ON "AdminUser"("email");
    CREATE INDEX IF NOT EXISTS idx_admin_user_username ON "AdminUser"("username");
    CREATE INDEX IF NOT EXISTS idx_admin_user_role ON "AdminUser"("role");
    CREATE INDEX IF NOT EXISTS idx_admin_user_active ON "AdminUser"("is_active");

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_admin_user_updated_at
        BEFORE UPDATE ON "AdminUser"
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    INSERT INTO "AdminUser" ("username", "email", "password_hash", "role")
    VALUES (
        'superadmin',
        'admin@sjbu-voting.com',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeehPCtcxNdvpBlO.2',
        'super_admin'
    ) ON CONFLICT ("username") DO NOTHING;

    CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" SERIAL PRIMARY KEY,
        "admin_id" INTEGER REFERENCES "AdminUser"("id"),
        "action" VARCHAR(100) NOT NULL,
        "target_type" VARCHAR(50),
        "target_id" VARCHAR(100),
        "details" JSONB,
        "ip_address" INET,
        "user_agent" TEXT,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON "AuditLog"("admin_id");
    CREATE INDEX IF NOT EXISTS idx_audit_log_action ON "AuditLog"("action");
    CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON "AuditLog"("created_at");

    CREATE TABLE IF NOT EXISTS "RateLimit" (
        "id" SERIAL PRIMARY KEY,
        "identifier" VARCHAR(255) NOT NULL,
        "request_count" INTEGER DEFAULT 1,
        "window_start" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "window_ms" INTEGER DEFAULT 300000,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON "RateLimit"("identifier");
    CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON "RateLimit"("window_start");

    CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
    RETURNS void AS $$
    BEGIN
        DELETE FROM "RateLimit"
        WHERE window_start < CURRENT_TIMESTAMP - INTERVAL '1 hour';
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION get_or_create_rate_limit(
        p_identifier VARCHAR(255),
        p_window_ms INTEGER DEFAULT 300000
    )
    RETURNS TABLE (
        request_count INTEGER,
        window_start TIMESTAMP,
        window_ms INTEGER
    ) AS $$
    DECLARE
        v_record RECORD;
    BEGIN
        SELECT * INTO v_record
        FROM "RateLimit"
        WHERE identifier = p_identifier
        AND window_start > CURRENT_TIMESTAMP - INTERVAL '1 millisecond' * p_window_ms;

        IF FOUND THEN
            UPDATE "RateLimit"
            SET request_count = request_count + 1
            WHERE identifier = p_identifier
            AND window_start = v_record.window_start;

            RETURN QUERY SELECT v_record.request_count + 1, v_record.window_start, v_record.window_ms;
        ELSE
            INSERT INTO "RateLimit" (identifier, window_ms)
            VALUES (p_identifier, p_window_ms);

            RETURN QUERY SELECT 1, CURRENT_TIMESTAMP, p_window_ms;
        END IF;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TABLE IF NOT EXISTS "User" (
        id SERIAL PRIMARY KEY,
        voucher VARCHAR(8) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Position" (
        id SERIAL PRIMARY KEY,
        position_name VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Candidate" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        position_id INT NOT NULL,
        manifesto TEXT,
        CONSTRAINT fk_position
            FOREIGN KEY (position_id)
            REFERENCES "Position"(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "Vote" (
        id SERIAL PRIMARY KEY,
        voucher VARCHAR(8) NOT NULL,
        candidate_id INT NOT NULL,
        position_id INT NOT NULL,
        verification_code VARCHAR(50) NOT NULL,
        CONSTRAINT fk_candidate
            FOREIGN KEY (candidate_id)
            REFERENCES "Candidate"(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_position_vote
            FOREIGN KEY (position_id)
            REFERENCES "Position"(id)
            ON DELETE CASCADE,
        CONSTRAINT fk_voucher
            FOREIGN KEY (voucher)
            REFERENCES "User"(voucher)
            ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_voucher ON "Vote"(voucher);
    CREATE INDEX IF NOT EXISTS idx_candidate ON "Vote"(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_position ON "Vote"(position_id);
    CREATE INDEX IF NOT EXISTS idx_user_voucher ON "User"(voucher);
    CREATE INDEX IF NOT EXISTS idx_position_name ON "Position"(position_name);
    CREATE INDEX IF NOT EXISTS idx_candidate_position ON "Candidate"(position_id);
    CREATE INDEX IF NOT EXISTS idx_vote_verification ON "Vote"(verification_code);
    """

    try:
        print("🚀 Starting database migration...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        cur.execute(create_tables_sql)
        conn.commit()

        print("✅ Migration completed successfully!")

        # Confirm connection
        cur.execute("SELECT version()")
        version = cur.fetchone()[0]
        print("Connected to:", version)

    except Exception as e:
        print("❌ Migration failed:", e)
        conn.rollback()
        sys.exit(1)

    finally:
        cur.close()
        conn.close()
        print("Connection closed.")

if __name__ == "__main__":
    main()
