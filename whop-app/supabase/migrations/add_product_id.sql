-- Update messages table to use product_id instead of product_category
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS product_id TEXT;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_messages_product_id ON messages(product_id);

-- Keep product_category for backward compatibility (optional)
-- You can drop it later: ALTER TABLE messages DROP COLUMN IF EXISTS product_category;

-- Add product name caching column (optional - to avoid always fetching from Whop)
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS product_name TEXT;

COMMENT ON COLUMN messages.product_id IS 'Whop product ID (prod_xxxxx) that this feedback is about';
COMMENT ON COLUMN messages.product_name IS 'Cached product name from Whop for display';

