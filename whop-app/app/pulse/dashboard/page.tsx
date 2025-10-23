'use client';

import { useEffect, useState, useCallback } from 'react';
import { Message, Reply } from '@/lib/supabase';
import MessageCard from '@/components/MessageCard';
import MetricsCard from '@/components/MetricsCard';
import Navbar from '@/components/Navbar';

// TODO: Connect Whop MCP for user authentication
// For now, we'll use a hardcoded creator ID from the test data
const CREATOR_ID = 'test-creator-id'; // This should come from Whop auth
const CREATOR_SLUG = 'testcreator'; // This should come from Whop user data

export default function DashboardPage() {
  const [messages, setMessages] = useState<(Message & { reply?: Reply[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'question' | 'feedback' | 'confession'>('all');
  const [showReviewed, setShowReviewed] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        creatorId: CREATOR_ID,
      });

      if (filter !== 'all') {
        const sentimentMap = {
          positive: 'up',
          negative: 'down',
          neutral: 'neutral',
        };
        params.append('sentiment', sentimentMap[filter]);
      }

      if (!showReviewed) {
        params.append('reviewed', 'false');
      }

      const response = await fetch(`/api/feedback?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const { data } = await response.json();
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, showReviewed]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleMarkReviewed = async (id: string, reviewed: boolean) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update feedback');
      }

      // Refresh feedback list
      await fetchFeedback();
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Failed to update feedback');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }

      // Refresh feedback list
      await fetchFeedback();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback');
    }
  };

  const copyFeedbackLink = () => {
    const link = `${window.location.origin}/p/${CREATOR_SLUG}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate metrics
  const totalFeedback = feedback.length;
  const reviewedCount = feedback.filter((f) => f.reviewed).length;
  const positiveCount = feedback.filter((f) => f.sentiment === 'up').length;
  const negativeCount = feedback.filter((f) => f.sentiment === 'down').length;
  const positivePercentage = totalFeedback > 0 
    ? Math.round((positiveCount / totalFeedback) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Feedback Dashboard</h1>
          <p className="text-gray-600">View and manage feedback from your community</p>
        </div>

        {/* Feedback Link Generator */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Feedback Link</h2>
          <p className="text-gray-600 mb-4">
            Share this link with your community to collect anonymous feedback:
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/p/${CREATOR_SLUG}`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <button
              onClick={copyFeedbackLink}
              className="px-6 py-2 bg-accent-9 text-white font-medium rounded-lg hover:bg-accent-10 transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Feedback"
            value={totalFeedback}
            subtitle="All time"
            icon={<span className="text-4xl">📊</span>}
          />
          <MetricsCard
            title="Reviewed"
            value={reviewedCount}
            subtitle={`${totalFeedback - reviewedCount} pending`}
            icon={<span className="text-4xl">✅</span>}
          />
          <MetricsCard
            title="Positive Sentiment"
            value={`${positivePercentage}%`}
            subtitle={`${positiveCount} positive responses`}
            icon={<span className="text-4xl">👍</span>}
          />
          <MetricsCard
            title="Negative Feedback"
            value={negativeCount}
            subtitle="Needs attention"
            icon={<span className="text-4xl">👎</span>}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-accent-9 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('positive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'positive'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👍 Positive
              </button>
              <button
                onClick={() => setFilter('neutral')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'neutral'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                😐 Neutral
              </button>
              <button
                onClick={() => setFilter('negative')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'negative'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👎 Negative
              </button>
            </div>

            <label className="flex items-center gap-2 ml-auto">
              <input
                type="checkbox"
                checked={showReviewed}
                onChange={(e) => setShowReviewed(e.target.checked)}
                className="w-4 h-4 text-accent-9 border-gray-300 rounded focus:ring-accent-9"
              />
              <span className="text-sm font-medium text-gray-700">Show reviewed</span>
            </label>
          </div>
        </div>

        {/* Feedback List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading feedback...</p>
          </div>
        ) : feedback.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">No feedback yet</p>
            <p className="text-gray-400 text-sm">
              Share your feedback link to start collecting responses
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <FeedbackCard
                key={item.id}
                feedback={item}
                onMarkReviewed={handleMarkReviewed}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* TODO: Add AI summary generation endpoint */}
      {/* TODO: Send weekly insights to creator */}
    </div>
  );
}

