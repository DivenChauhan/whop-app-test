'use client';

import { Message, Reply } from '@/lib/supabase';
import { useState } from 'react';
import { Button, Typography } from '@whop/frosted-ui';
import EmojiReactions from './EmojiReactions';

interface MessageCardProps {
  message: Message & { reply?: Reply[] };
  onMarkReviewed?: (id: string, reviewed: boolean) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onReply?: (messageId: string, replyText: string, isPublic: boolean) => Promise<void>;
  onToggleReplyVisibility?: (replyId: string, isPublic: boolean) => Promise<void>;
}

export default function MessageCard({ 
  message, 
  onMarkReviewed, 
  onDelete, 
  onReply,
  onToggleReplyVisibility 
}: MessageCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [makePrivate, setMakePrivate] = useState(false); // FIXED: Changed to makePrivate - when unchecked = public
  const [reactionCount, setReactionCount] = useState(0);

  const isHot = reactionCount >= 5;

  const handleToggleReviewed = async () => {
    if (!onMarkReviewed) return;
    setIsLoading(true);
    try {
      await onMarkReviewed(message.id, !message.reviewed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this message?')) return;
    setIsLoading(true);
    try {
      await onDelete(message.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!onReply || !replyText.trim()) return;
    setIsLoading(true);
    try {
      await onReply(message.id, replyText.trim(), !makePrivate); // FIXED: Inverted logic - unchecked = public
      setReplyText('');
      setMakePrivate(false);
      setShowReplyModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async (replyId: string, currentVisibility: boolean) => {
    if (!onToggleReplyVisibility) return;
    setIsLoading(true);
    try {
      await onToggleReplyVisibility(replyId, !currentVisibility);
    } finally {
      setIsLoading(false);
    }
  };

  const getTagLabel = () => {
    switch (message.tag) {
      case 'question': return '❓ Questions';
      case 'feedback': return '💬 Feedback';
      case 'confession': return '🤫 Confessions';
      default: return '📝 Other';
    }
  };

  const getProductCategoryLabel = () => {
    if (!message.product_category) return null;
    const labels = {
      main_product: '🚀 Product',
      service: '⚡ Service',
      feature_request: '🎁 Feature',
      bug_report: '🐛 Bug',
      other: '📝 Other',
    };
    return labels[message.product_category];
  };

  const reply = Array.isArray(message.reply) && message.reply.length > 0 ? message.reply[0] : null;
  const messageAge = Date.now() - new Date(message.created_at).getTime();
  const isNew = messageAge < 24 * 60 * 60 * 1000;

  return (
    <div className={`bg-white/[0.03] rounded-2xl p-6 transition-all hover:bg-white/[0.05] ${
      message.reviewed ? 'opacity-60' : ''
    } ${isHot ? 'bg-gradient-to-br from-white/[0.03] to-orange-500/5' : ''}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 bg-white/[0.08] text-white text-base rounded-md border border-white/[0.1]">
            {getTagLabel()}
          </span>
          
          {message.product_category && (
            <span className="px-3 py-1 bg-white/[0.08] text-white text-sm rounded-md border border-white/[0.1]">
              {getProductCategoryLabel()}
            </span>
          )}
          
                {isHot && (
                  <span className="px-3 py-1 bg-orange-500/30 text-white text-sm font-semibold rounded-md border border-orange-500/50">
                    🔥 Hot
                  </span>
                )}
                
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

      {/* Reply Display */}
      {reply && (
        <div className="mb-6 p-5 bg-blue-500/10 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Typography as="span" variant="body-sm" className="text-white font-semibold">
                Your Reply
              </Typography>
              <span className={`px-3 py-1 text-sm rounded-md border ${
                reply.is_public 
                  ? 'bg-white/[0.08] text-white border-white/[0.1]' 
                  : 'bg-white/[0.08] text-white border-white/[0.1]'
              }`}>
                {reply.is_public ? '👁️ Public' : '🔒 Private'}
              </span>
            </div>
            {onToggleReplyVisibility && (
              <Button
                onClick={() => handleToggleVisibility(reply.id, reply.is_public)}
                disabled={isLoading}
                size="sm"
                variant="secondary"
                className="text-white"
              >
                {reply.is_public ? 'Make Private' : 'Make Public'}
              </Button>
            )}
          </div>
          <Typography as="p" variant="body" className="text-white">
            {reply.reply_text}
          </Typography>
        </div>
      )}

      {/* Reactions */}
      <div className="mb-6 pt-6 border-t border-white/[0.08]">
        <Typography as="p" variant="body-sm" className="text-white mb-3 font-semibold">
          Reactions
        </Typography>
        <EmojiReactions 
          messageId={message.id}
          onReactionUpdate={(count) => setReactionCount(count)}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {onReply && !reply && (
            <Button
              onClick={() => setShowReplyModal(true)}
              disabled={isLoading}
              size="md"
              variant="primary"
              className="text-white"
            >
              Reply
            </Button>
          )}
          {onMarkReviewed && (
            <Button
              onClick={handleToggleReviewed}
              disabled={isLoading}
              size="md"
              variant={message.reviewed ? 'secondary' : 'primary'}
              className="text-white"
            >
              {isLoading ? 'Loading...' : message.reviewed ? 'Unmark Reviewed' : 'Mark Reviewed'}
            </Button>
          )}
        </div>
        {onDelete && (
          <div className="ml-auto">
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              size="md"
              variant="danger"
              className="text-white"
            >
              🗑️ Delete
            </Button>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl max-w-2xl w-full p-8">
            <Typography as="h3" variant="title" className="text-white mb-6 font-bold">
              Reply to Message
            </Typography>
            
            <div className="mb-5 p-4 bg-white/[0.03] rounded-xl border border-white/[0.08]">
              <Typography as="p" variant="body" className="text-white">
                {message.message}
              </Typography>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.08] text-white text-base placeholder:text-white/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-5"
              rows={5}
              disabled={isLoading}
            />

            <label className="flex items-center gap-3 mb-6 cursor-pointer group p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all">
              <input
                type="checkbox"
                checked={makePrivate}
                onChange={(e) => setMakePrivate(e.target.checked)}
                disabled={isLoading}
                className="w-5 h-5 text-blue-600 bg-white/20 border-white/40 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <Typography as="span" variant="body" className="text-white font-medium">
                Make reply private (only you can see it)
              </Typography>
            </label>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmitReply}
                disabled={isLoading || !replyText.trim()}
                size="lg"
                variant="primary"
                className="flex-1"
              >
                {isLoading ? 'Sending...' : 'Send Reply'}
              </Button>
              <Button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setMakePrivate(false);
                }}
                disabled={isLoading}
                size="lg"
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
