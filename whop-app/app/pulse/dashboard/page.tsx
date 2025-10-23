'use client';

import { useEffect, useState, useCallback } from 'react';
import { Message, Reply, ProductCategory } from '@/lib/supabase';
import { Button, Input, Typography, Badge } from '@whop/frosted-ui';
import { Copy, Check } from 'lucide-react';
import MessageCard from '@/components/MessageCard';
import MessageModal from '@/components/MessageModal';
import Navbar from '@/components/Navbar';

// This page is creator-only - part of the /pulse/ dashboard routes
// In production, add proper authentication middleware to protect these routes
const CREATOR_ID = '00000000-0000-0000-0000-000000000001';
const CREATOR_SLUG = 'testcreator';

interface MessageWithReactions extends Message {
  reply?: Reply[];
  reaction_count?: number;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<MessageWithReactions[]>([]);
  const [allMessages, setAllMessages] = useState<MessageWithReactions[]>([]); // For hot posts calculation
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'question' | 'feedback' | 'confession'>('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [showReviewed, setShowReviewed] = useState(false);
  const [showOnlyUnanswered, setShowOnlyUnanswered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageWithReactions | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch filtered messages
      const params = new URLSearchParams({ creatorId: CREATOR_ID });
      if (filter !== 'all') params.append('tag', filter);
      if (productCategoryFilter !== 'all') params.append('productCategory', productCategoryFilter);
      params.append('reviewed', showReviewed ? 'true' : 'false');

      const response = await fetch(`/api/feedback?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const { data } = await response.json();
      setMessages(data || []);

      // Also fetch ALL messages (without filters) with reaction counts for hot posts
      // Use feedback API so creators see all their replies (public + private)
      const allMessagesResponse = await fetch(`/api/feedback?creatorId=${CREATOR_ID}`);
      if (allMessagesResponse.ok) {
        const { data: allMessagesData } = await allMessagesResponse.json();
        
        // Get reaction counts for each message
        const messagesWithReactions = await Promise.all(
          (allMessagesData || []).map(async (message: any) => {
            const reactionResponse = await fetch(`/api/reactions?messageId=${message.id}&userHash=count_only`);
            let reactionCount = 0;
            
            if (reactionResponse.ok) {
              const reactionData = await reactionResponse.json();
              reactionCount = reactionData.data?.length || 0;
            }
            
            return {
              ...message,
              reaction_count: reactionCount,
            };
          })
        );
        
        // Sort by reaction count (descending), then by created_at (descending) - same as feed
        const sortedMessages = messagesWithReactions.sort((a, b) => {
          const reactionDiff = (b.reaction_count || 0) - (a.reaction_count || 0);
          if (reactionDiff !== 0) return reactionDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        setAllMessages(sortedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, productCategoryFilter, showReviewed]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkReviewed = async (id: string, reviewed: boolean) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed }),
      });

      if (!response.ok) throw new Error('Failed to update message');
      await fetchMessages();
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete message');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, replyText, isPublic }),
      });

      if (!response.ok) throw new Error('Failed to submit reply');
      await fetchMessages();
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply');
    }
  };

  const handleToggleReplyVisibility = async (replyId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/replies/${replyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic }),
      });

      if (!response.ok) throw new Error('Failed to update reply visibility');
      await fetchMessages();
    } catch (error) {
      console.error('Error updating reply visibility:', error);
      alert('Failed to update reply visibility');
    }
  };

  const copyFeedbackLink = () => {
    const link = `${origin}/p/${CREATOR_SLUG}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Analytics
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const totalMessages = messages.length;
  const thisWeekMessages = messages.filter(m => new Date(m.created_at) >= oneWeekAgo).length;

  const oldUnansweredMessages = messages.filter(m => {
    const hasNoReply = !m.reply || m.reply.length === 0;
    const isOld = new Date(m.created_at) < threeDaysAgo;
    return hasNoReply && isOld;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <Typography as="h1" variant="display-sm" className="text-white mb-3 font-bold">
            Dashboard
          </Typography>
          <Typography as="p" variant="body" className="text-white text-lg">
            Manage your anonymous messages
          </Typography>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white/[0.03] rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
            <Typography as="p" variant="body-sm" className="text-white mb-2 font-medium">
              Total Messages
            </Typography>
            <Typography as="p" variant="display-sm" className="text-white font-bold">
              {totalMessages}
            </Typography>
          </div>

          <div className="bg-white/[0.03] rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
            <Typography as="p" variant="body-sm" className="text-white mb-2 font-medium">
              This Week
            </Typography>
            <Typography as="p" variant="display-sm" className="text-white font-bold">
              {thisWeekMessages}
            </Typography>
          </div>

          <div className="bg-white/[0.03] rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
            <Typography as="p" variant="body-sm" className="text-white mb-2 font-medium">
              Pending
            </Typography>
            <Typography as="p" variant="display-sm" className="text-white font-bold">
              {messages.filter(m => !m.reply || m.reply.length === 0).length}
            </Typography>
          </div>

          <div className="bg-white/[0.03] rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
            <Typography as="p" variant="body-sm" className="text-white mb-2 font-medium">
              Replied
            </Typography>
            <Typography as="p" variant="display-sm" className="text-white font-bold">
              {messages.filter(m => m.reply && m.reply.length > 0).length}
            </Typography>
          </div>
        </div>

        {/* Share Link */}
        <div className="bg-white/[0.03] rounded-2xl p-6 mb-8">
          <Typography as="h2" variant="title-sm" className="text-white mb-2 font-semibold">
            Share Your Link
          </Typography>
          <Typography as="p" variant="body-sm" className="text-white mb-5">
            Share this link to collect anonymous messages
          </Typography>
          <div className="flex gap-3">
            <Input
              isReadOnly
              value={`${origin}/p/${CREATOR_SLUG}`}
              className="flex-1 text-base text-white bg-white/[0.05] border-white/[0.1]"
            />
            <Button onClick={copyFeedbackLink} size="md" variant="primary" className="text-white">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Hot Posts Section */}
        {allMessages.filter(m => (m.reaction_count || 0) >= 5).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🔥</span>
              <Typography as="h2" variant="title" className="text-white font-bold">
                Hot Posts
              </Typography>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30">
                {allMessages.filter(m => (m.reaction_count || 0) >= 5).slice(0, 5).length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {allMessages
                .filter(m => (m.reaction_count || 0) >= 5)
                .slice(0, 5)
                .map((message) => {
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
                          {message.reaction_count || 0}
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

        {/* Alert for old messages */}
        {oldUnansweredMessages.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <Typography as="h3" variant="title-sm" className="text-yellow-400 mb-1">
                  {oldUnansweredMessages.length} Message{oldUnansweredMessages.length !== 1 ? 's' : ''} Need Attention
                </Typography>
                <Typography as="p" variant="body-sm" className="text-yellow-200/80">
                  These messages are older than 3 days and haven't received a reply yet.
                </Typography>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/[0.03] rounded-2xl p-6 mb-8">
          <Typography as="h3" variant="title-sm" className="text-white mb-5 font-semibold">
            Filters
          </Typography>
          
          {/* Message Type Filter */}
          <div className="mb-6">
            <Typography as="p" variant="body-sm" className="text-white mb-3 font-medium">
              Message Type
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

          {/* Category Filter */}
          <div className="mb-6 pb-6 border-b border-white/[0.08]">
            <Typography as="p" variant="body-sm" className="text-white mb-3 font-medium">
              Product Category
            </Typography>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setProductCategoryFilter('all')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all text-base ${
                  productCategoryFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setProductCategoryFilter('main_product')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all text-base ${
                  productCategoryFilter === 'main_product'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]'
                }`}
              >
                🚀 Product
              </button>
              <button
                onClick={() => setProductCategoryFilter('service')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all text-base ${
                  productCategoryFilter === 'service'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]'
                }`}
              >
                ⚡ Service
              </button>
              <button
                onClick={() => setProductCategoryFilter('feature_request')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all text-base ${
                  productCategoryFilter === 'feature_request'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]'
                }`}
              >
                🎁 Feature
              </button>
              <button
                onClick={() => setProductCategoryFilter('bug_report')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all text-base ${
                  productCategoryFilter === 'bug_report'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]'
                }`}
              >
                🐛 Bug
              </button>
              <button
                onClick={() => setProductCategoryFilter('other')}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all text-base ${
                  productCategoryFilter === 'other'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.08]'
                }`}
              >
                📝 Other
              </button>
            </div>
          </div>

          {/* Show Reviewed Toggle */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showReviewed}
                onChange={(e) => setShowReviewed(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <Typography as="span" variant="body" className="text-white group-hover:text-blue-400 transition-colors">
                Show reviewed messages
              </Typography>
            </label>

            {/* Show Only Unanswered Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={showOnlyUnanswered}
                onChange={(e) => setShowOnlyUnanswered(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <Typography as="span" variant="body" className="text-white group-hover:text-blue-400 transition-colors">
                Only show unanswered
              </Typography>
            </label>
          </div>
        </div>

        {/* Messages */}
        <div>
          <Typography as="h2" variant="title" className="text-white mb-6 font-bold">
            Messages
          </Typography>
          
          {isLoading ? (
            <div className="bg-white/[0.03] rounded-2xl p-16 text-center">
              <Typography as="p" variant="body" className="text-white">
                Loading messages...
              </Typography>
            </div>
          ) : (() => {
            // Filter messages based on unanswered toggle
            const filteredMessages = showOnlyUnanswered 
              ? messages.filter(msg => !msg.reply || msg.reply.length === 0)
              : messages;
            
            return filteredMessages.length === 0 ? (
              <div className="bg-white/[0.03] rounded-2xl p-16 text-center">
                <Typography as="p" variant="title-sm" className="text-white mb-2">
                  {showOnlyUnanswered ? 'No unanswered messages' : 'No messages yet'}
                </Typography>
                <Typography as="p" variant="body-sm" className="text-white">
                  {showOnlyUnanswered 
                    ? "All messages have been answered!" 
                    : "Share your link to start receiving anonymous messages"}
                </Typography>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredMessages.map((message) => (
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
            );
          })()}
        </div>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <MessageModal
          message={selectedMessage}
          isOpen={!!selectedMessage}
          onClose={() => {
            setSelectedMessage(null);
            fetchMessages(); // Refresh messages after closing modal
          }}
          onReply={handleReply}
          onToggleReplyVisibility={handleToggleReplyVisibility}
          onMarkReviewed={handleMarkReviewed}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
