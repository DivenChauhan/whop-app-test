import { getUserAuth } from '@/lib/auth';
import FeedContent from './FeedContent';

// This page is public - anyone can access
const CREATOR_ID = '00000000-0000-0000-0000-000000000001';
const CREATOR_NAME = 'Test Creator';

export default async function PublicFeedPage() {
  // Check if user is authenticated and a creator (but don't require it)
  const auth = await getUserAuth();
  
  return <FeedContent creatorId={CREATOR_ID} creatorName={CREATOR_NAME} isCreator={auth.isCreator} />;
}

// Type exports for the client component
export interface MessageWithRelations {
  id: string;
  message: string;
  tag: string;
  product_category?: string;
  created_at: string;
  creator_id: string;
  reviewed?: boolean;
  replies: Array<{
    id: string;
    message_id: string;
    reply_text: string;
    is_public: boolean;
    created_at: string;
  }>;
  reaction_count: number;
}

export type SortOption = 'newest' | 'most_reacted' | 'most_replied';
