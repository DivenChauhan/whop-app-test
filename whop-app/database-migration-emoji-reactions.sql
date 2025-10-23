-- Migration: Add emoji reactions support
-- This adds user_hash column to reactions table and updates default reaction type

-- Add user_hash column to reactions table
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS user_hash TEXT;

-- Update existing reactions to have a placeholder user_hash
UPDATE reactions SET user_hash = 'legacy_user' WHERE user_hash IS NULL;

-- Make user_hash NOT NULL after populating existing data
ALTER TABLE reactions ALTER COLUMN user_hash SET NOT NULL;

-- Update reaction_type default to emoji
ALTER TABLE reactions ALTER COLUMN reaction_type SET DEFAULT '👍';

-- Optional: Clear old reactions if you want a fresh start
-- TRUNCATE TABLE reactions;

-- Create index on user_hash for faster lookups
CREATE INDEX IF NOT EXISTS idx_reactions_user_hash ON reactions(user_hash);

-- Create composite index for preventing duplicate reactions
CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_unique_user_emoji 
  ON reactions(message_id, reaction_type, user_hash);

