-- Add imageurl column to Candidate table
-- Migration: 005_add_candidate_imageurl
-- Created: 2025-11-08

-- Add imageurl column to Candidate table
ALTER TABLE "Candidate" 
ADD COLUMN IF NOT EXISTS "imageurl" VARCHAR(255);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_imageurl ON "Candidate"("imageurl");