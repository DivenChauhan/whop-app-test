'use client';

import { useEffect, useState } from 'react';
import { Typography, Button } from '@whop/frosted-ui';
import Navbar from '@/components/Navbar';

// This page is creator-only - part of the /pulse/ dashboard routes
// In production, add proper authentication middleware to protect these routes
const CREATOR_ID = '00000000-0000-0000-0000-000000000001';

interface Analytics {
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

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await fetch(`/api/analytics?creatorId=${CREATOR_ID}&period=${period}`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        
        const { data } = await response.json();
        setAnalytics(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching analytics:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  const getTagLabel = (tag: string) => {
    const labels: Record<string, string> = {
      question: '❓ Questions',
      feedback: '💬 Feedback',
      confession: '🤫 Confessions',
    };
    return labels[tag] || tag;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      main_product: '🚀 Product',
      service: '⚡ Service',
      feature_request: '🎁 Feature',
      bug_report: '🐛 Bug',
      other: '📝 Other',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <Typography as="h1" variant="display-sm" className="!text-white mb-3 font-bold">
            Analytics
          </Typography>
          <Typography as="p" variant="body" className="!text-white text-lg">
            Insights and trends from your messages
          </Typography>
        </div>

        {/* Period Filter */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-8">
          <Typography as="p" variant="body-sm" className="!text-white mb-4 font-medium">
            Time Period
          </Typography>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setPeriod('week')}
              variant={period === 'week' ? 'primary' : 'secondary'}
              size="md"
              className={period !== 'week' ? 'text-white' : ''}
            >
              Last 7 Days
            </Button>
            <Button
              onClick={() => setPeriod('month')}
              variant={period === 'month' ? 'primary' : 'secondary'}
              size="md"
              className={period !== 'month' ? 'text-white' : ''}
            >
              Last 30 Days
            </Button>
            <Button
              onClick={() => setPeriod('all')}
              variant={period === 'all' ? 'primary' : 'secondary'}
              size="md"
              className={period !== 'all' ? 'text-white' : ''}
            >
              All Time
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-16 text-center">
            <Typography as="p" variant="body" className="!text-white">
              Loading analytics...
            </Typography>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <Typography as="p" variant="body" className="text-red-400">
              Error: {error}
            </Typography>
          </div>
        ) : !analytics ? (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-16 text-center">
            <Typography as="p" variant="body" className="text-white">
              No analytics data available
            </Typography>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div>
              <Typography as="h2" variant="title" className="!text-white mb-6 font-bold">
                Overview
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
                  <Typography as="p" variant="body-sm" className="!text-white mb-2 font-medium">
                    Total Messages
                  </Typography>
                  <Typography as="p" variant="display-sm" className="!text-white font-bold mb-1">
                    {analytics.summary.totalMessages}
                  </Typography>
                  <Typography as="p" variant="body-sm" className="!text-white">
                    All feedback received
                  </Typography>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
                  <Typography as="p" variant="body-sm" className="!text-white mb-2 font-medium">
                    Total Reactions
                  </Typography>
                  <Typography as="p" variant="display-sm" className="!text-white font-bold mb-1">
                    {analytics.summary.totalReactions}
                  </Typography>
                  <Typography as="p" variant="body-sm" className="!text-white">
                    Community engagement
                  </Typography>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
                  <Typography as="p" variant="body-sm" className="!text-white mb-2 font-medium">
                    Response Rate
                  </Typography>
                  <Typography as="p" variant="display-sm" className="!text-white font-bold mb-1">
                    {analytics.summary.responseRate}%
                  </Typography>
                  <Typography as="p" variant="body-sm" className="!text-white">
                    Messages with replies
                  </Typography>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
                  <Typography as="p" variant="body-sm" className="!text-white mb-2 font-medium">
                    Avg Response Time
                  </Typography>
                  <Typography as="p" variant="display-sm" className="!text-white font-bold mb-1">
                    {analytics.summary.averageResponseTime}
                  </Typography>
                  <Typography as="p" variant="body-sm" className="!text-white">
                    Time to respond
                  </Typography>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <Typography as="p" variant="body-sm" className="!text-white mb-2 font-medium">
                  Public Replies
                </Typography>
                <Typography as="p" variant="title" className="!text-white font-bold">
                  {analytics.summary.publicRepliesCount}
                </Typography>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <Typography as="p" variant="body-sm" className="!text-white mb-2 font-medium">
                  Avg Reactions/Message
                </Typography>
                <Typography as="p" variant="title" className="!text-white font-bold">
                  {typeof analytics.summary.averageReactionsPerMessage === 'number' 
                    ? analytics.summary.averageReactionsPerMessage.toFixed(1) 
                    : analytics.summary.averageReactionsPerMessage}
                </Typography>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <Typography as="p" variant="body-sm" className="!text-white mb-2 font-medium">
                  Unanswered (3+ days)
                </Typography>
                <Typography as="p" variant="title" className="!text-white font-bold">
                  {analytics.summary.oldUnansweredCount}
                </Typography>
              </div>
            </div>

            {/* Message Types Distribution */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <Typography as="h3" variant="title-sm" className="!text-white mb-5 font-semibold">
                Message Types
              </Typography>
              <div className="space-y-4">
                {Object.entries(analytics.distributions.tags).map(([tag, count]) => (
                  <div key={tag}>
                    <div className="flex justify-between items-center mb-2">
                      <Typography as="span" variant="body" className="!text-white font-medium">
                        {getTagLabel(tag)}
                      </Typography>
                      <Typography as="span" variant="body" className="!text-white">
                        {count} ({((count / analytics.summary.totalMessages) * 100).toFixed(0)}%)
                      </Typography>
                    </div>
                    <div className="w-full bg-white/[0.05] rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${(count / analytics.summary.totalMessages) * 100}%`,
                          background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(29, 78, 216))'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Categories */}
            {Object.keys(analytics.distributions.productCategories).length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <Typography as="h3" variant="title-sm" className="!text-white mb-5 font-semibold">
                  Product Categories
                </Typography>
                <div className="space-y-4">
                  {Object.entries(analytics.distributions.productCategories).map(([category, count]) => (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-2">
                        <Typography as="span" variant="body" className="!text-white font-medium">
                          {getCategoryLabel(category)}
                        </Typography>
                        <Typography as="span" variant="body" className="!text-white">
                          {count} ({((count / analytics.summary.totalMessages) * 100).toFixed(0)}%)
                        </Typography>
                      </div>
                      <div className="w-full bg-white/[0.05] rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${(count / analytics.summary.totalMessages) * 100}%`,
                            background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(29, 78, 216))'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Peak Engagement */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
              <Typography as="h3" variant="title-sm" className="!text-white mb-2 font-semibold">
                🔥 Peak Engagement
              </Typography>
              <Typography as="p" variant="body" className="text-white">
                <span className="font-bold text-white">{analytics.summary.peakEngagementDay}</span> had the most activity with{' '}
                <span className="font-bold text-white">{analytics.summary.peakEngagementCount} messages</span>
              </Typography>
            </div>

            {/* Top Reactions */}
            {Object.keys(analytics.distributions.reactionTypes).length > 0 && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <Typography as="h3" variant="title-sm" className="!text-white mb-5 font-semibold">
                  Top Reactions
                </Typography>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analytics.distributions.reactionTypes)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 4)
                    .map(([emoji, count]) => (
                      <div key={emoji} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-center">
                        <div className="text-4xl mb-2">{emoji}</div>
                        <Typography as="p" variant="title-sm" className="!text-white font-bold">
                          {count}
                        </Typography>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
