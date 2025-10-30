-- Add election management tables for complete election control
-- Migration: 004_add_election_management_tables
-- Created: 2025-10-20

-- Election status tracking table
CREATE TABLE IF NOT EXISTS "ElectionStatus" (
    "id" SERIAL PRIMARY KEY,
    "status" VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'active', 'paused', 'completed', 'cancelled')),
    "started_at" TIMESTAMP,
    "paused_at" TIMESTAMP,
    "completed_at" TIMESTAMP,
    "cancelled_at" TIMESTAMP,
    "settings" JSONB DEFAULT '{"allowVoting": false, "showResults": false, "requireVerification": true}',
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_election_status_updated_at
    BEFORE UPDATE ON "ElectionStatus"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Runoff election management tables
CREATE TABLE IF NOT EXISTS "RunoffElection" (
    "id" SERIAL PRIMARY KEY,
    "original_position_id" INTEGER NOT NULL REFERENCES "Position"("id"),
    "original_position_name" VARCHAR(100) NOT NULL,
    "tied_candidates" JSONB NOT NULL,
    "status" VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    "started_at" TIMESTAMP,
    "completed_at" TIMESTAMP,
    "winner_candidate_id" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for runoff election updates
CREATE TRIGGER update_runoff_election_updated_at
    BEFORE UPDATE ON "RunoffElection"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Runoff candidates table
CREATE TABLE IF NOT EXISTS "RunoffCandidate" (
    "id" SERIAL PRIMARY KEY,
    "runoff_election_id" INTEGER NOT NULL REFERENCES "RunoffElection"("id") ON DELETE CASCADE,
    "candidate_id" INTEGER NOT NULL REFERENCES "Candidate"("id"),
    "candidate_name" VARCHAR(100) NOT NULL,
    "original_vote_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for runoff candidates
CREATE INDEX IF NOT EXISTS idx_runoff_candidate_election ON "RunoffCandidate"("runoff_election_id");
CREATE INDEX IF NOT EXISTS idx_runoff_candidate_candidate ON "RunoffCandidate"("candidate_id");

-- Runoff votes table
CREATE TABLE IF NOT EXISTS "RunoffVote" (
    "id" SERIAL PRIMARY KEY,
    "runoff_election_id" INTEGER NOT NULL REFERENCES "RunoffElection"("id") ON DELETE CASCADE,
    "voucher" VARCHAR(8) NOT NULL REFERENCES "User"("voucher"),
    "candidate_id" INTEGER NOT NULL,
    "verification_code" VARCHAR(50) NOT NULL,
    "voted_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_runoff_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES "Candidate"("id")
        ON DELETE CASCADE
);

-- Create indexes for runoff votes
CREATE INDEX IF NOT EXISTS idx_runoff_vote_election ON "RunoffVote"("runoff_election_id");
CREATE INDEX IF NOT EXISTS idx_runoff_vote_voucher ON "RunoffVote"("voucher");
CREATE INDEX IF NOT EXISTS idx_runoff_vote_candidate ON "RunoffVote"("candidate_id");
CREATE INDEX IF NOT EXISTS idx_runoff_vote_verification ON "RunoffVote"("verification_code");

-- Insert default election status if not exists
INSERT INTO "ElectionStatus" ("status", "settings")
SELECT 'not_started', '{"allowVoting": false, "showResults": false, "requireVerification": true}'
WHERE NOT EXISTS (SELECT 1 FROM "ElectionStatus");

-- Create indexes for election status
CREATE INDEX IF NOT EXISTS idx_election_status_status ON "ElectionStatus"("status");
CREATE INDEX IF NOT EXISTS idx_election_status_created_at ON "ElectionStatus"("created_at");

-- Create indexes for runoff elections
CREATE INDEX IF NOT EXISTS idx_runoff_election_status ON "RunoffElection"("status");
CREATE INDEX IF NOT EXISTS idx_runoff_election_position ON "RunoffElection"("original_position_id");
CREATE INDEX IF NOT EXISTS idx_runoff_election_created_at ON "RunoffElection"("created_at");