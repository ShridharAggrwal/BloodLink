-- Migration: Add forgot password and campaign enhancements
-- Run this migration to add new features to the database

BEGIN;

-- 1. Password reset table
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reset_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(reset_token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);

-- 2. Update campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS health_checkup_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS blood_units_collected INTEGER,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Add constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'campaigns_status_check'
  ) THEN
    ALTER TABLE campaigns 
    ADD CONSTRAINT campaigns_status_check 
    CHECK (status IN ('active', 'ended'));
  END IF;
END $$;

-- 3. Update NGOs table for statistics
ALTER TABLE ngos 
ADD COLUMN IF NOT EXISTS campaigns_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS blood_requests_accepted INTEGER DEFAULT 0;

-- 4. Initialize campaign counts for existing NGOs
UPDATE ngos n
SET campaigns_count = (
  SELECT COUNT(*) FROM campaigns c 
  WHERE c.ngo_id = n.id
)
WHERE campaigns_count = 0;

COMMIT;

-- Display success message
SELECT 'Migration completed successfully!' as status;
