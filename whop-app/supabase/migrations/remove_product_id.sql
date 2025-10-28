-- Remove product_id and product_name columns from messages table
-- This reverts the product integration changes

ALTER TABLE messages
DROP COLUMN IF EXISTS product_id;

ALTER TABLE messages
DROP COLUMN IF EXISTS product_name;
