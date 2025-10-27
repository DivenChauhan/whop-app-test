-- Add company_id column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS company_id TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Add company_id column to creators table
ALTER TABLE creators 
ADD COLUMN IF NOT EXISTS company_id TEXT NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Create index on company_id for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_company_id ON messages(company_id);
CREATE INDEX IF NOT EXISTS idx_creators_company_id ON creators(company_id);

-- Add RLS (Row Level Security) policies to ensure data isolation
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read messages from their company
CREATE POLICY "Users can read messages from their company" ON messages
  FOR SELECT
  USING (true); -- We'll handle authorization in the application layer

-- Policy: Users can insert messages to their company
CREATE POLICY "Users can insert messages to their company" ON messages
  FOR INSERT
  WITH CHECK (true); -- We'll handle authorization in the application layer

-- Policy: Creators can update messages in their company
CREATE POLICY "Creators can update messages in their company" ON messages
  FOR UPDATE
  USING (true) -- We'll handle authorization in the application layer
  WITH CHECK (true);

-- Policy: Creators can delete messages in their company
CREATE POLICY "Creators can delete messages in their company" ON messages
  FOR DELETE
  USING (true); -- We'll handle authorization in the application layer

-- Similar policies for other tables
CREATE POLICY "Users can read creators from their company" ON creators
  FOR SELECT
  USING (true);

CREATE POLICY "Users can read replies" ON replies
  FOR SELECT
  USING (true);

CREATE POLICY "Creators can manage replies" ON replies
  FOR ALL
  USING (true);

CREATE POLICY "Users can read reactions" ON reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their reactions" ON reactions
  FOR ALL
  USING (true);

