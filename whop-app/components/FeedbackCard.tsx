'use client';

import { Feedback } from '@/lib/supabase';
import { useState } from 'react';

interface FeedbackCardProps {
  feedback: Feedback;
  onMarkReviewed?: (id: string, reviewed: boolean) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function FeedbackCard({ feedback, onMarkReviewed, onDelete }: FeedbackCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleReviewed = async () => {
    if (!onMarkReviewed) return;
    setIsLoading(true);
    try {
      await onMarkReviewed(feedback.id, !feedback.reviewed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    setIsLoading(true);
    try {
      await onDelete(feedback.id);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentIcon = () => {
    switch (feedback.sentiment) {
      case 'up':
        return '👍';
      case 'down':
        return '👎';
      default:
        return '😐';
    }
  };

  const getSentimentColor = () => {
    switch (feedback.sentiment) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${feedback.reviewed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`text-2xl p-2 rounded-lg ${getSentimentColor()}`}>
            {getSentimentIcon()}
          </span>
          <div>
            <p className="text-sm text-gray-500">
              {new Date(feedback.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {feedback.reviewed && (
              <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded mt-1">
                Reviewed
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{feedback.message}</p>

      <div className="flex gap-2">
        {onMarkReviewed && (
          <button
            onClick={handleToggleReviewed}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              feedback.reviewed
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-accent-9 text-white hover:bg-accent-10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Loading...' : feedback.reviewed ? 'Mark as Unreviewed' : 'Mark as Reviewed'}
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
    </div>
  );
}

