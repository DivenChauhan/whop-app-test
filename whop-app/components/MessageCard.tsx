'use client';

import { Message, Reply } from '@/lib/supabase';
import { useState } from 'react';

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
  const [replyIsPublic, setReplyIsPublic] = useState(false);

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
      await onReply(message.id, replyText.trim(), replyIsPublic);
      setReplyText('');
      setReplyIsPublic(false);
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

  const getTagIcon = () => {
    switch (message.tag) {
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

  const getTagColor = () => {
    switch (message.tag) {
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

  const reply = Array.isArray(message.reply) && message.reply.length > 0 ? message.reply[0] : null;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${message.reviewed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`text-2xl p-2 rounded-lg ${getTagColor()}`}>
            {getTagIcon()}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-700 capitalize">{message.tag}</p>
            <p className="text-sm text-gray-500">
              {new Date(message.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {message.reviewed && (
              <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded mt-1">
                Reviewed
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{message.message}</p>

      {/* Reply Display */}
      {reply && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-accent-9">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Your Reply</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${reply.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                {reply.is_public ? '👁️ Public' : '🔒 Private'}
              </span>
              {onToggleReplyVisibility && (
                <button
                  onClick={() => handleToggleVisibility(reply.id, reply.is_public)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1 bg-accent-9 text-white rounded hover:bg-accent-10 transition-colors disabled:opacity-50"
                >
                  Toggle
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-700">{reply.reply_text}</p>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        {onReply && !reply && (
          <button
            onClick={() => setShowReplyModal(true)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-accent-9 text-white rounded-lg hover:bg-accent-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reply
          </button>
        )}
        {onMarkReviewed && (
          <button
            onClick={handleToggleReviewed}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              message.reviewed
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-green-500 text-white hover:bg-green-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Loading...' : message.reviewed ? 'Mark as Unreviewed' : 'Mark as Reviewed'}
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reply to Message</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">{message.message}</p>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-9 focus:border-transparent resize-none mb-4"
              rows={4}
              disabled={isLoading}
            />

            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={replyIsPublic}
                onChange={(e) => setReplyIsPublic(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 text-accent-9 border-gray-300 rounded focus:ring-accent-9"
              />
              <span className="text-sm text-gray-700">Make reply public (visible in feed)</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitReply}
                disabled={isLoading || !replyText.trim()}
                className="flex-1 px-4 py-2 bg-accent-9 text-white font-medium rounded-lg hover:bg-accent-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Reply'}
              </button>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setReplyIsPublic(false);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

