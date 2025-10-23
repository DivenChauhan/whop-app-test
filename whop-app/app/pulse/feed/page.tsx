'use client';

import { useEffect, useState, useCallback } from 'react';
import { Message, Reply, Reaction } from '@/lib/supabase';
import Navbar from '@/components/Navbar';

// TODO: Connect Whop MCP for user authentication
const CREATOR_ID = 'test-creator-id';
const CREATOR_NAME = 'Test Creator'; // Should come from Whop user data

interface MessageWithRelations extends Message {
  replies: Reply[];
  reaction_count: number;
}

export default function PublicFeedPage() {
  const [messages, setMessages] = useState<MessageWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'question' | 'feedback' | 'confession'>('all');
  const [reactingMessageId, setReactingMessageId] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        creatorId: CREATOR_ID,
      });

      const response = await fetch(`/api/feed?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }

      const { data } = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleReaction = async (messageId: string) => {
    setReactingMessageId(messageId);
    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          reactionType: 'thumbs_up',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      // Refresh feed to show updated reaction count
      await fetchFeed();
    } catch (error) {
      console.error('Error adding reaction:', error);
      alert('Failed to add reaction');
    } finally {
      setReactingMessageId(null);
    }
  };

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'question':
        return '❓';
      case 'feedback':
        return '💬';
      case 'confession':
        return '🤫';
      default:
        return '📝';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'question':
        return 'text-blue-600 bg-blue-50';
      case 'feedback':
        return 'text-green-600 bg-green-50';
      case 'confession':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(m => m.tag === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {CREATOR_NAME}'s Public Feed
          </h1>
          <p className="text-gray-600">
            See what the community is sharing and creator responses
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
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
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading feed...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-2">No messages yet</p>
            <p className="text-gray-400 text-sm">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Message Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl p-2 rounded-lg ${getTagColor(message.tag)}`}>
                      {getTagIcon(message.tag)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-700 capitalize">
                        {message.tag}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{message.message}</p>

                {/* Public Replies */}
                {message.replies && message.replies.length > 0 && (
                  <div className="mt-4 p-4 bg-accent-1 rounded-lg border-l-4 border-accent-9">
                    <p className="text-sm font-medium text-accent-11 mb-2">
                      {CREATOR_NAME}'s Reply
                    </p>
                    {message.replies.map((reply) => (
                      <p key={reply.id} className="text-gray-700">
                        {reply.reply_text}
                      </p>
                    ))}
                  </div>
                )}

                {/* Reaction Bar */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-lg">👍</span>
                    <span className="text-sm font-medium">
                      {message.reaction_count} {message.reaction_count === 1 ? 'reaction' : 'reactions'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleReaction(message.id)}
                    disabled={reactingMessageId === message.id}
                    className="px-4 py-2 text-sm font-medium bg-accent-3 text-accent-11 rounded-lg hover:bg-accent-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reactingMessageId === message.id ? 'Adding...' : '👍 React'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-accent-9 to-accent-10 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Have something to share?</h2>
          <p className="mb-4 text-accent-1">
            Send an anonymous message to {CREATOR_NAME}
          </p>
          <a
            href={`/p/${CREATOR_ID}`}
            className="inline-block px-6 py-3 bg-white text-accent-11 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Send Message
          </a>
        </div>
      </div>
    </div>
  );
}

