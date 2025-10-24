import { requireCreator } from '@/lib/auth';
import AnalyticsContent from './AnalyticsContent';

// This page is creator-only - protected by authentication
const CREATOR_ID = '00000000-0000-0000-0000-000000000001';

export default async function AnalyticsPage() {
  // Protect this page - only creators can access
  await requireCreator();
  
  return <AnalyticsContent creatorId={CREATOR_ID} />;
}

// Type definitions for the client component
export interface Analytics {
  summary: {
    totalMessages: number;
    totalReactions: number;
    totalReplies: number;
    publicRepliesCount: number;
    averageReactionsPerMessage: number;
    responseRate: number;
    averageResponseTime: string;
    oldUnansweredCount: number;
    peakEngagementDay: string;
    peakEngagementCount: number;
  };
  distributions: {
    tags: Record<string, number>;
    productCategories: Record<string, number>;
    reactionTypes: Record<string, number>;
    hours: Record<string, number>;
  };
  trends: {
    messagesPerDay: Array<{ date: string; count: number }>;
  };
}
