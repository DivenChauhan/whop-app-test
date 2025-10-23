'use client';

import { useState } from 'react';
import { Sentiment } from '@/lib/supabase';

interface FeedbackFormProps {
  creatorId: string;
  creatorName?: string;
  onSuccess?: () => void;
}

export default function FeedbackForm({ creatorId, creatorName, onSuccess }: FeedbackFormProps) {
  const [message, setMessage] = useState('');
  const [sentiment, setSentiment] = useState<Sentiment>('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!message.trim()) {
      setError('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId,
          message: message.trim(),
          sentiment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSuccess(true);
      setMessage('');
      setSentiment('neutral');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Share Your Feedback
      </h2>
      {creatorName && (
        <p className="text-gray-600 mb-6">
          Send anonymous feedback to {creatorName}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts, suggestions, or concerns..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-9 focus:border-transparent resize-none"
            rows={6}
            disabled={isSubmitting}
            maxLength={1000}
          />
          <p className="text-sm text-gray-500 mt-1">
            {message.length}/1000 characters
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How do you feel about this?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSentiment('up')}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-4 text-lg rounded-lg font-medium transition-all ${
                sentiment === 'up'
                  ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              👍 Positive
            </button>
            <button
              type="button"
              onClick={() => setSentiment('neutral')}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-4 text-lg rounded-lg font-medium transition-all ${
                sentiment === 'neutral'
                  ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              😐 Neutral
            </button>
            <button
              type="button"
              onClick={() => setSentiment('down')}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-4 text-lg rounded-lg font-medium transition-all ${
                sentiment === 'down'
                  ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              👎 Negative
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✓ Thank you! Your feedback has been submitted anonymously.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="w-full px-6 py-3 bg-accent-9 text-white font-medium rounded-lg hover:bg-accent-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Your feedback is completely anonymous. We don't collect any personal information.
        </p>
      </form>
    </div>
  );
}

