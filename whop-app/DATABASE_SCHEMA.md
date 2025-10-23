# Pulse MVP - Supabase Database Schema

## Setup Instructions

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to the SQL Editor and run the SQL commands below
3. Copy your project URL and anon key to `.env.development.local`

## SQL Schema

```sql
-- Create creators table
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  feedback_link TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('up', 'down', 'neutral')),
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_feedback_creator_id ON feedback(creator_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_reviewed ON feedback(reviewed);
CREATE INDEX idx_creators_feedback_link ON creators(feedback_link);

-- Enable Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access to creators by feedback_link
CREATE POLICY "Allow public read access to creators"
  ON creators FOR SELECT
  USING (true);

-- Allow public insert to feedback
CREATE POLICY "Allow public insert to feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- Allow creator to read their own feedback
CREATE POLICY "Allow creator to read their own feedback"
  ON feedback FOR SELECT
  USING (true);

-- Allow creator to update their own feedback
CREATE POLICY "Allow creator to update their own feedback"
  ON feedback FOR UPDATE
  USING (true);

-- Insert a test creator (you can modify this or create through the app later)
INSERT INTO creators (name, email, feedback_link)
VALUES ('Test Creator', 'test@example.com', 'testcreator');
```

## Environment Variables

Add these to your `.env.development.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

You can find these in your Supabase project settings under "API".

