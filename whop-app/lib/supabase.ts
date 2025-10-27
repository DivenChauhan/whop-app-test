import { createClient } from '@supabase/supabase-js';

// Supabase client for client-side operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Supabase client for server-side operations (with service role)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Database types
export type MessageTag = 'question' | 'feedback' | 'confession';
export type ProductCategory = 'main_product' | 'service' | 'feature_request' | 'bug_report' | 'other';

export interface Message {
  id: string;
  creator_id: string;
  company_id: string;
  message: string;
  tag: MessageTag;
  product_category?: ProductCategory; // Deprecated - keeping for backward compatibility
  product_id?: string; // Whop product ID (prod_xxxxx)
  product_name?: string; // Cached product name
  created_at: string;
  reviewed: boolean;
}

export interface WhopProduct {
  id: string;
  name: string;
  visibility: string;
  created_at: number;
}

export interface Reply {
  id: string;
  message_id: string;
  reply_text: string;
  is_public: boolean;
  created_at: string;
}

export interface Reaction {
  id: string;
  message_id: string;
  reaction_type: string;
  user_hash: string;
  created_at: string;
}

export interface Creator {
  id: string;
  company_id: string;
  name: string;
  email: string;
  feedback_link: string;
  created_at: string;
}

// Extended types with relations
export interface MessageWithReply extends Message {
  reply?: Reply;
  reaction_count?: number;
}

