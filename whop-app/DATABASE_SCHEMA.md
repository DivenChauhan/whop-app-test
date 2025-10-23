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

-- Create messages table (renamed from feedback)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('question', 'feedback', 'confession')),
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create replies table
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'thumbs_up',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_messages_creator_id ON messages(creator_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_reviewed ON messages(reviewed);
CREATE INDEX idx_messages_tag ON messages(tag);
CREATE INDEX idx_creators_feedback_link ON creators(feedback_link);
CREATE INDEX idx_replies_message_id ON replies(message_id);
CREATE INDEX idx_replies_is_public ON replies(is_public);
CREATE INDEX idx_reactions_message_id ON reactions(message_id);

-- Enable Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access to creators
CREATE POLICY "Allow public read access to creators"
  ON creators FOR SELECT
  USING (true);

-- Allow public insert to messages
CREATE POLICY "Allow public insert to messages"
  ON messages FOR INSERT
  WITH CHECK (true);

-- Allow public read access to messages
CREATE POLICY "Allow public read access to messages"
  ON messages FOR SELECT
  USING (true);

-- Allow creator to update their own messages
CREATE POLICY "Allow creator to update their own messages"
  ON messages FOR UPDATE
  USING (true);

-- Allow creator to delete their own messages
CREATE POLICY "Allow creator to delete their own messages"
  ON messages FOR DELETE
  USING (true);

-- Allow public read access to public replies
CREATE POLICY "Allow public read access to public replies"
  ON replies FOR SELECT
  USING (is_public = true);

-- Allow creator to read all replies
CREATE POLICY "Allow creator to read all replies"
  ON replies FOR SELECT
  USING (true);

-- Allow creator to insert replies
CREATE POLICY "Allow creator to insert replies"
  ON replies FOR INSERT
  WITH CHECK (true);

-- Allow creator to update replies
CREATE POLICY "Allow creator to update replies"
  ON replies FOR UPDATE
  USING (true);

-- Allow creator to delete replies
CREATE POLICY "Allow creator to delete replies"
  ON replies FOR DELETE
  USING (true);

-- Allow public insert to reactions
CREATE POLICY "Allow public insert to reactions"
  ON reactions FOR INSERT
  WITH CHECK (true);

-- Allow public read access to reactions
CREATE POLICY "Allow public read access to reactions"
  ON reactions FOR SELECT
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

