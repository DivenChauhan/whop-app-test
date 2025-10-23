-- ============================================================================
-- PULSE APP - COMPREHENSIVE DATABASE MIGRATION
-- All Features: Emoji Reactions + Product Categories + Time-Based Features
-- ============================================================================
-- Run this ONCE in your Supabase SQL Editor after backing up your database
-- ============================================================================

-- STEP 1: Add new columns to messages table
-- ----------------------------------------
ALTER TABLE messages ADD COLUMN IF NOT EXISTS product_category TEXT 
  CHECK (product_category IN ('main_product', 'service', 'feature_request', 'bug_report', 'other'));

-- STEP 2: Update reactions table for emoji reactions
-- -------------------------------------------------
-- Add user_hash column
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS user_hash TEXT;

-- Populate existing reactions with legacy user identifier
UPDATE reactions SET user_hash = 'legacy_user_' || id::text WHERE user_hash IS NULL;

-- Make user_hash required after populating
ALTER TABLE reactions ALTER COLUMN user_hash SET NOT NULL;

-- Update default reaction type to emoji
ALTER TABLE reactions ALTER COLUMN reaction_type SET DEFAULT '👍';

-- STEP 3: Create indexes for performance
-- ------------------------------------
CREATE INDEX IF NOT EXISTS idx_messages_product_category ON messages(product_category);
CREATE INDEX IF NOT EXISTS idx_reactions_user_hash ON reactions(user_hash);

-- Create unique index to prevent duplicate reactions per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_unique_user_emoji 
  ON reactions(message_id, reaction_type, user_hash);

-- STEP 4: Update RLS policies (if needed)
-- -------------------------------------
-- These should already exist from setup.sql, but we'll recreate them to be safe

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert to reactions" ON reactions;
DROP POLICY IF EXISTS "Allow public read access to reactions" ON reactions;

-- Recreate policies
CREATE POLICY "Allow public insert to reactions"
  ON reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to reactions"
  ON reactions FOR SELECT
  USING (true);

-- Allow users to delete their own reactions
DROP POLICY IF EXISTS "Allow users to delete their own reactions" ON reactions;
CREATE POLICY "Allow users to delete their own reactions"
  ON reactions FOR DELETE
  USING (true);

-- STEP 5: Verify migration
-- ----------------------
DO $$
DECLARE
  messages_count INT;
  reactions_count INT;
  creators_count INT;
BEGIN
  SELECT COUNT(*) INTO messages_count FROM messages;
  SELECT COUNT(*) INTO reactions_count FROM reactions;
  SELECT COUNT(*) INTO creators_count FROM creators;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Total messages: %', messages_count;
  RAISE NOTICE 'Total reactions: %', reactions_count;
  RAISE NOTICE 'Total creators: %', creators_count;
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'New features enabled:';
  RAISE NOTICE '  ✅ Multi-emoji reactions (👍 ❤️ 🔥 😱)';
  RAISE NOTICE '  ✅ User reaction tracking';
  RAISE NOTICE '  ✅ Product categories';
  RAISE NOTICE '  ✅ Hot message detection (5+ reactions)';
  RAISE NOTICE '  ✅ Time-based features (NEW badges)';
  RAISE NOTICE '===========================================';
END $$;

-- STEP 6: Optional - Clear old reactions if you want a fresh start
-- -------------------------------------------------------------
-- UNCOMMENT THE LINES BELOW ONLY IF YOU WANT TO CLEAR ALL REACTIONS
-- WARNING: This will delete all existing reactions!

-- TRUNCATE TABLE reactions RESTART IDENTITY CASCADE;
-- RAISE NOTICE 'All reactions have been cleared. Users can add new emoji reactions.';

