'use client';

import { useState } from 'react';
import { MessageTag, ProductCategory } from '@/lib/supabase';

interface MessageFormProps {
  creatorId: string;
  creatorName?: string;
  onSuccess?: () => void;
}

export default function MessageForm({ creatorId, creatorName, onSuccess }: MessageFormProps) {
  const [message, setMessage] = useState('');
  const [tag, setTag] = useState<MessageTag>('feedback');
  const [productCategory, setProductCategory] = useState<ProductCategory | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!message.trim()) {
      setError('Please enter your message');
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
          tag,
          productCategory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit message');
      }

      setSuccess(true);
      setMessage('');
      setTag('feedback');
      setProductCategory(undefined);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Failed to submit message. Please try again.');
      console.error('Error submitting message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg p-2">
      {creatorName && (
        <p className="text-white/70 mb-6">
          Share your thoughts with {creatorName}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
            Your Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your question, feedback, or confession anonymously..."
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-white/40"
            rows={6}
            disabled={isSubmitting}
            maxLength={1000}
          />
          <p className="text-sm text-white/50 mt-1">
            {message.length}/1000 characters
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Message Type
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTag('question')}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-4 text-lg rounded-lg font-medium transition-all ${
                tag === 'question'
                  ? 'bg-blue-600/30 text-blue-300 ring-2 ring-blue-500'
                  : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] border border-white/[0.1]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ❓ Question
            </button>
            <button
              type="button"
              onClick={() => setTag('feedback')}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-4 text-lg rounded-lg font-medium transition-all ${
                tag === 'feedback'
                  ? 'bg-green-600/30 text-green-300 ring-2 ring-green-500'
                  : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] border border-white/[0.1]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              💬 Feedback
            </button>
            <button
              type="button"
              onClick={() => setTag('confession')}
              disabled={isSubmitting}
              className={`flex-1 px-6 py-4 text-lg rounded-lg font-medium transition-all ${
                tag === 'confession'
                  ? 'bg-purple-600/30 text-purple-300 ring-2 ring-purple-500'
                  : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] border border-white/[0.1]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🤫 Confession
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Product Category <span className="text-white/40 text-xs">(Optional)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProductCategory(productCategory === 'main_product' ? undefined : 'main_product')}
              disabled={isSubmitting}
              className={`px-4 py-3 text-sm rounded-lg font-medium transition-all ${
                productCategory === 'main_product'
                  ? 'bg-purple-600/30 text-purple-300 ring-2 ring-purple-500'
                  : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.08] border border-white/[0.08]'
              } disabled:opacity-50`}
            >
              🚀 Main Product
            </button>
            <button
              type="button"
              onClick={() => setProductCategory(productCategory === 'service' ? undefined : 'service')}
              disabled={isSubmitting}
              className={`px-4 py-3 text-sm rounded-lg font-medium transition-all ${
                productCategory === 'service'
                  ? 'bg-yellow-600/30 text-yellow-300 ring-2 ring-yellow-500'
                  : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.08] border border-white/[0.08]'
              } disabled:opacity-50`}
            >
              ⚡ Service
            </button>
            <button
              type="button"
              onClick={() => setProductCategory(productCategory === 'feature_request' ? undefined : 'feature_request')}
              disabled={isSubmitting}
              className={`px-4 py-3 text-sm rounded-lg font-medium transition-all ${
                productCategory === 'feature_request'
                  ? 'bg-green-600/30 text-green-300 ring-2 ring-green-500'
                  : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.08] border border-white/[0.08]'
              } disabled:opacity-50`}
            >
              🎁 Feature Request
            </button>
            <button
              type="button"
              onClick={() => setProductCategory(productCategory === 'bug_report' ? undefined : 'bug_report')}
              disabled={isSubmitting}
              className={`px-4 py-3 text-sm rounded-lg font-medium transition-all ${
                productCategory === 'bug_report'
                  ? 'bg-red-600/30 text-red-300 ring-2 ring-red-500'
                  : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.08] border border-white/[0.08]'
              } disabled:opacity-50`}
            >
              🐛 Bug Report
            </button>
            <button
              type="button"
              onClick={() => setProductCategory(productCategory === 'other' ? undefined : 'other')}
              disabled={isSubmitting}
              className={`px-4 py-3 text-sm rounded-lg font-medium transition-all ${
                productCategory === 'other'
                  ? 'bg-white/20 text-white ring-2 ring-white/50'
                  : 'bg-white/[0.03] text-white/60 hover:bg-white/[0.08] border border-white/[0.08]'
              } disabled:opacity-50`}
            >
              📝 Other
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-300">
              ✓ Thank you! Your message has been submitted anonymously.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !message.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Message'}
        </button>

        <p className="text-xs text-white/50 mt-4 text-center">
          Your message is completely anonymous. We don't collect any personal information.
        </p>
      </form>
    </div>
  );
}

