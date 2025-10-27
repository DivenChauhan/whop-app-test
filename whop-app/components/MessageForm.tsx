'use client';

import { useState, useEffect } from 'react';
import { MessageTag, ProductCategory, WhopProduct } from '@/lib/supabase';

interface MessageFormProps {
  creatorId: string;
  creatorName?: string;
  onSuccess?: () => void;
}

export default function MessageForm({ creatorId, creatorName, onSuccess }: MessageFormProps) {
  const [message, setMessage] = useState('');
  const [tag, setTag] = useState<MessageTag>('feedback');
  const [productCategory, setProductCategory] = useState<ProductCategory | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [products, setProducts] = useState<WhopProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const { data } = await response.json();
          setProducts(data || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

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
          productId: selectedProduct?.id || null,
          productName: selectedProduct?.name || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit message');
      }

      setSuccess(true);
      setMessage('');
      setTag('feedback');
      setProductCategory(undefined);
      setSelectedProduct(null);

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
        <p className="text-white mb-6">
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
          <p className="text-sm text-white mt-1">
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
                  : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.1]'
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
                  : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.1]'
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
                  : 'bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.1]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🤫 Confession
            </button>
          </div>
        </div>

        {/* Product Selection - Shows actual Whop products */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Related Product <span className="text-white text-xs">(Optional)</span>
          </label>
          
          {loadingProducts ? (
            <div className="px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white text-sm">
              Loading products...
            </div>
          ) : products.length > 0 ? (
            <select
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const productId = e.target.value;
                if (productId) {
                  const product = products.find(p => p.id === productId);
                  setSelectedProduct(product ? { id: product.id, name: product.name } : null);
                } else {
                  setSelectedProduct(null);
                }
              }}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a product (optional)</option>
              {products.map((product) => (
                <option key={product.id} value={product.id} className="bg-[#0A0A0A] text-white">
                  {product.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-lg text-white text-sm">
              No products found. This creator hasn't added any products yet.
            </div>
          )}
          
          {selectedProduct && (
            <p className="mt-2 text-xs text-white">
              ✓ Feedback will be associated with: <span className="font-semibold">{selectedProduct.name}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-sm !text-white">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg">
            <p className="text-sm !text-white">
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

        <p className="text-xs text-white mt-4 text-center">
          Your message is completely anonymous. We don't collect any personal information.
        </p>
      </form>
    </div>
  );
}

