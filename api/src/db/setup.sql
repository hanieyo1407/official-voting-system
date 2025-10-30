-- Admin User table for role-based access control
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_user_email ON "AdminUser"("email");
CREATE INDEX IF NOT EXISTS idx_admin_user_username ON "AdminUser"("username");
CREATE INDEX IF NOT EXISTS idx_admin_user_role ON "AdminUser"("role");
CREATE INDEX IF NOT EXISTS idx_admin_user_active ON "AdminUser"("is_active");

-- Create trigger to update updated_at timestamp
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

-- Insert default super admin (password: 'admin123' - CHANGE THIS IN PRODUCTION!)
-- This is a bcrypt hash for 'admin123'
INSERT INTO "AdminUser" ("username", "email", "password_hash", "role")
VALUES (
    'superadmin',
    'admin@sjbu-voting.com',
    '$2b$12$NM0tjlLD8gZGAkRMxs5n.eYq/P7r49iQAgiX1kvRyI3avDBJWpZl.',
    'super_admin'
) ON CONFLICT ("username") DO NOTHING;

-- Create audit log table for tracking admin actions
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

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON "AuditLog"("admin_id");
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON "AuditLog"("action");
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON "AuditLog"("created_at");

-- Create rate limiting table for tracking requests
CREATE TABLE IF NOT EXISTS "RateLimit" (
    "id" SERIAL PRIMARY KEY,
    "identifier" VARCHAR(255) NOT NULL,
    "request_count" INTEGER DEFAULT 1,
    "window_start" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "window_ms" INTEGER DEFAULT 300000,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON "RateLimit"("identifier");
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON "RateLimit"("window_start");

-- Create function to clean old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM "RateLimit"
    WHERE window_start < CURRENT_TIMESTAMP - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create function to get or create rate limit record
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
    -- Try to get existing record
    SELECT * INTO v_record
    FROM "RateLimit"
    WHERE identifier = p_identifier
    AND window_start > CURRENT_TIMESTAMP - INTERVAL '1 millisecond' * p_window_ms;

    IF FOUND THEN
        -- Update existing record
        UPDATE "RateLimit"
        SET request_count = request_count + 1
        WHERE identifier = p_identifier
        AND window_start = v_record.window_start;

        RETURN QUERY SELECT v_record.request_count + 1, v_record.window_start, v_record.window_ms;
    ELSE
        -- Create new record
        INSERT INTO "RateLimit" (identifier, window_ms)
        VALUES (p_identifier, p_window_ms);

        RETURN QUERY SELECT 1, CURRENT_TIMESTAMP, p_window_ms;
    END IF;
END;
$$ LANGUAGE plpgsql;