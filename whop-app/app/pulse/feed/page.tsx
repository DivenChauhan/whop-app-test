'use client';

import { useEffect, useState, useCallback } from 'react';
import { Message, Reply } from '@/lib/supabase';
import { Typography } from '@whop/frosted-ui';
import Navbar from '@/components/Navbar';
import EmojiReactions from '@/components/EmojiReactions';
import MessageModal from '@/components/MessageModal';

const CREATOR_ID = '00000000-0000-0000-0000-000000000001';

interface MessageWithRelations extends Message {
  replies: Reply[];
  reaction_count: number;
}

export default function PublicFeedPage() {
  const [messages, setMessages] = useState<MessageWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'question' | 'feedback' | 'confession'>('all');
  const [selectedMessage, setSelectedMessage] = useState<MessageWithRelations | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ creatorId: CREATOR_ID });
      
      if (filter !== 'all') params.append('tag', filter);

      const response = await fetch(`/api/feed?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch messages');

      const { data } = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case 'question': return '❓ Questions';
      case 'feedback': return '💬 Feedback';
      case 'confession': return '🤫 Confessions';
      default: return '📝 Other';
    }
  };

  // Separate hot posts (top 5 with most reactions) from regular messages
  const hotPosts = messages.filter(m => m.reaction_count >= 5).slice(0, 5);
  const regularMessages = messages.filter(m => !hotPosts.includes(m));

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <Typography as="h1" variant="display-sm" className="text-white mb-3 font-bold">
            Community Feed
          </Typography>
          <Typography as="p" variant="body" className="text-white text-lg">
            React to messages and help prioritize what gets answered
          </Typography>
        </div>

        {/* Filters */}
        <div className="bg-white/[0.03] rounded-2xl p-6 mb-8">
          <Typography as="p" variant="body-sm" className="text-white mb-4 font-medium">
            Filter by type
          </Typography>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all text-base ${
                filter === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('question')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all text-base ${
                filter === 'question'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]'
              }`}
            >
              ❓ Questions
            </button>
            <button
              onClick={() => setFilter('feedback')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all text-base ${
                filter === 'feedback'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]'
              }`}
            >
              💬 Feedback
            </button>
            <button
              onClick={() => setFilter('confession')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all text-base ${
                filter === 'confession'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]'
              }`}
            >
              🤫 Confessions
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white/[0.03] rounded-2xl p-16 text-center">
            <Typography as="p" variant="body" className="text-white">
              Loading messages...
            </Typography>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white/[0.03] rounded-2xl p-16 text-center">
            <Typography as="p" variant="title-sm" className="text-white mb-2">
              No messages yet
            </Typography>
            <Typography as="p" variant="body-sm" className="text-white">
              Be the first to leave a message!
            </Typography>
          </div>
        ) : (
          <>
            {/* Hot Posts Section */}
            {hotPosts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🔥</span>
                  <Typography as="h2" variant="title" className="text-white font-bold">
                    Hot Posts
                  </Typography>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30">
                    {hotPosts.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {hotPosts.map((message) => {
                    const messageAge = Date.now() - new Date(message.created_at).getTime();
                    const isNew = messageAge < 24 * 60 * 60 * 1000;

                    return (
                      <div
                        key={message.id}
                        onClick={() => setSelectedMessage(message)}
                        className="bg-gradient-to-br from-white/[0.05] to-orange-500/10 rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        {/* Large Reaction Count */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-6xl font-bold text-orange-400">
                            {message.reaction_count}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">🔥</span>
                              <Typography as="span" variant="body-sm" className="text-orange-300 font-semibold">
                                Hot Post
                              </Typography>
                            </div>
                            {isNew && (
                              <span className="px-2 py-1 bg-purple-500/30 text-purple-200 text-xs font-semibold rounded-md">
                                ✨ New
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message Preview */}
                        <Typography as="p" variant="body" className="text-white mb-3 line-clamp-2">
                          {message.message}
                        </Typography>

                        {/* Timestamp */}
                        <Typography as="span" variant="body-sm" className="text-white/50">
                          {new Date(message.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Messages Section */}
            <div>
              <Typography as="h2" variant="title" className="text-white mb-6 font-bold">
                All Messages
              </Typography>
              <Typography as="p" variant="body-sm" className="text-white/60 mb-6">
                Manage and reply to your messages
              </Typography>

              <div className="space-y-5">
                {regularMessages.map((message) => {
                  const messageAge = Date.now() - new Date(message.created_at).getTime();
                  const isNew = messageAge < 24 * 60 * 60 * 1000;

                  return (
                    <div
                      key={message.id}
                      className="bg-white/[0.03] rounded-2xl p-6 transition-all hover:bg-white/[0.05]"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 bg-white/[0.08] text-white text-base rounded-md border border-white/[0.1]">
                            {getTagLabel(message.tag)}
                          </span>
                          
                          {isNew && (
                            <span className="px-3 py-1 bg-purple-500/30 text-white text-sm font-semibold rounded-md border border-purple-500/50">
                              ✨ New
                            </span>
                          )}
                        </div>
                        
                        <Typography as="span" variant="body-sm" className="text-white/60 whitespace-nowrap ml-3">
                          {new Date(message.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </div>

                      {/* Message Content */}
                      <Typography as="p" variant="body" className="text-white mb-6 whitespace-pre-wrap leading-relaxed text-lg">
                        {message.message}
                      </Typography>

                      {/* Public Reply */}
                      {message.replies && message.replies.length > 0 && message.replies.some(r => r.is_public) && (
                        <div className="mb-6 p-5 bg-blue-500/10 rounded-xl border border-blue-500/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Typography as="span" variant="body-sm" className="text-white font-semibold">
                              Creator's Reply
                            </Typography>
                            <span className="px-3 py-1 text-sm rounded-md border bg-white/[0.08] text-white border-white/[0.1]">
                              👁️ Public
                            </span>
                          </div>
                          <Typography as="p" variant="body" className="text-white">
                            {message.replies.find(r => r.is_public)?.reply_text}
                          </Typography>
                        </div>
                      )}

                      {/* Reactions */}
                      <div className="pt-6 border-t border-white/[0.08]">
                        <Typography as="p" variant="body-sm" className="text-white mb-3 font-semibold">
                          Reactions
                        </Typography>
                        <EmojiReactions messageId={message.id} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <MessageModal
          message={{
            ...selectedMessage,
            reply: selectedMessage.replies
          }}
          isOpen={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}
