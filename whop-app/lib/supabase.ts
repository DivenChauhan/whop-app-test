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
export type Sentiment = 'up' | 'down' | 'neutral';

export interface Feedback {
  id: string;
  creator_id: string;
  message: string;
  sentiment: Sentiment;
  created_at: string;
  reviewed: boolean;
}

export interface Creator {
  id: string;
  name: string;
  email: string;
  feedback_link: string;
  created_at: string;
}

