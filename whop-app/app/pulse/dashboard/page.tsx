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

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        creatorId: CREATOR_ID,
      });

      if (filter !== 'all') {
        params.append('tag', filter);
      }

      if (!showReviewed) {
        params.append('reviewed', 'false');
      }

      const response = await fetch(`/api/feedback?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const { data } = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, showReviewed]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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
        throw new Error('Failed to update message');
      }

      // Refresh messages list
      await fetchMessages();
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      // Refresh messages list
      await fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleReply = async (messageId: string, replyText: string, isPublic: boolean) => {
    try {
      const response = await fetch('/api/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          replyText,
          isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create reply');
      }

      // Refresh messages list to show the new reply
      await fetchMessages();
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('Failed to create reply');
    }
  };

  const handleToggleReplyVisibility = async (replyId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/replies/${replyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reply visibility');
      }

      // Refresh messages list to show updated visibility
      await fetchMessages();
    } catch (error) {
      console.error('Error updating reply visibility:', error);
      alert('Failed to update reply visibility');
    }
  };

  const copyFeedbackLink = () => {
    const link = `${window.location.origin}/p/${CREATOR_SLUG}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate metrics
  const totalMessages = messages.length;
  const reviewedCount = messages.filter((m) => m.reviewed).length;
  const questionCount = messages.filter((m) => m.tag === 'question').length;
  const feedbackCount = messages.filter((m) => m.tag === 'feedback').length;
  const confessionCount = messages.filter((m) => m.tag === 'confession').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Message Dashboard</h1>
          <p className="text-gray-600">View and manage anonymous messages from your community</p>
        </div>

        {/* Message Link Generator */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Message Link</h2>
          <p className="text-gray-600 mb-4">
            Share this link with your community to collect anonymous messages:
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
            title="Total Messages"
            value={totalMessages}
            subtitle="All time"
            icon={<span className="text-4xl">📊</span>}
          />
          <MetricsCard
            title="Questions"
            value={questionCount}
            subtitle="Need answers"
            icon={<span className="text-4xl">❓</span>}
          />
          <MetricsCard
            title="Feedback"
            value={feedbackCount}
            subtitle="Insights shared"
            icon={<span className="text-4xl">💬</span>}
          />
          <MetricsCard
            title="Confessions"
            value={confessionCount}
            subtitle="Anonymous thoughts"
            icon={<span className="text-4xl">🤫</span>}
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
                onClick={() => setFilter('question')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'question'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ❓ Questions
              </button>
              <button
                onClick={() => setFilter('feedback')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'feedback'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                💬 Feedback
              </button>
              <button
                onClick={() => setFilter('confession')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'confession'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🤫 Confessions
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

        {/* Messages List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">No messages yet</p>
            <p className="text-gray-400 text-sm">
              Share your message link to start collecting responses
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onMarkReviewed={handleMarkReviewed}
                onDelete={handleDelete}
                onReply={handleReply}
                onToggleReplyVisibility={handleToggleReplyVisibility}
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
