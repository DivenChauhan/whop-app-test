import { requireCreator } from '@/lib/auth';
import { getCreatorForCompany } from '@/lib/creator';
import AnalyticsContent from './AnalyticsContent';
import { notFound } from 'next/navigation';

export default async function AnalyticsPage() {
  // Protect this page - only creators can access
  const auth = await requireCreator();
  
  if (!auth.companyId) {
    throw new Error('Company ID not found');
  }

  // Get the creator for this company dynamically
  const creator = await getCreatorForCompany(auth.companyId);
  
  if (!creator) {
    notFound();
  }
  
  return <AnalyticsContent creatorId={creator.id} />;
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
