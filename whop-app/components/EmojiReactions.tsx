'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Smile } from 'lucide-react';

// Dynamically import EmojiPicker to avoid SSR issues
const Picker = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
);

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface EmojiReactionsProps {
  messageId: string;
  initialReactions?: { emoji: string; count: number }[];
  onReactionUpdate?: (totalCount: number) => void;
  compact?: boolean; // Show a smaller, preview version
}

// Quick reactions
const quickReactions = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😱', label: 'Shock' }
];

// Simple hash function to generate consistent user identifier
const getUserHash = () => {
  if (typeof window === 'undefined') return 'anonymous';
  
  const userAgent = navigator.userAgent;
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash).toString(36)}`;
};

export default function EmojiReactions({ 
  messageId, 
  initialReactions = [],
  onReactionUpdate,
  compact = false
}: EmojiReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [userHash] = useState(getUserHash());
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  useEffect(() => {
    fetchReactions();
  }, [messageId]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/api/reactions?messageId=${messageId}&userHash=${userHash}`);
      if (!response.ok) throw new Error('Failed to fetch reactions');
      
      const { data } = await response.json();
      
      // Transform API response to component state
      const reactionMap = new Map<string, Reaction>();
      
      // Initialize with quick reactions
      quickReactions.forEach(({ emoji }) => {
        reactionMap.set(emoji, { emoji, count: 0, hasReacted: false });
      });
      
      // Add all reactions from API (including custom emojis)
      data.forEach((r: any) => {
        const existing = reactionMap.get(r.reaction_type) || { emoji: r.reaction_type, count: 0, hasReacted: false };
        existing.count++;
        if (r.user_hash === userHash) {
          existing.hasReacted = true;
        }
        reactionMap.set(r.reaction_type, existing);
      });
      
      const allReactions = Array.from(reactionMap.values());
      setReactions(allReactions);
      
      // Calculate total count and notify parent
      const totalCount = allReactions.reduce((sum, r) => sum + r.count, 0);
      if (onReactionUpdate) {
        onReactionUpdate(totalCount);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleEmojiClick = async (emoji: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const reaction = reactions.find(r => r.emoji === emoji);
      const hasReacted = reaction?.hasReacted;
      
      if (hasReacted) {
        // Remove reaction
        const response = await fetch('/api/reactions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, emoji, userHash })
        });
        
        if (!response.ok) throw new Error('Failed to remove reaction');
      } else {
        // Add reaction
        const response = await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, reactionType: emoji, userHash })
        });
        
        if (!response.ok) throw new Error('Failed to add reaction');
      }
      
      // Refresh reactions
      await fetchReactions();
    } catch (error) {
      console.error('Error handling emoji reaction:', error);
      // Refresh anyway to ensure consistency
      await fetchReactions();
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiSelect = async (emojiData: any) => {
    setShowPicker(false);
    await handleEmojiClick(emojiData.emoji);
  };

  // Compact mode: only show reactions with counts > 0
  if (compact) {
    const reactionsWithCounts = reactions.filter(r => r.count > 0);

    if (reactionsWithCounts.length === 0) {
      return (
        <div className="flex items-center gap-2 text-white text-xs">
          <span>No reactions yet - be the first!</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {reactionsWithCounts.map(({ emoji, count }) => (
          <span
            key={emoji}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-xs"
          >
            <span>{emoji}</span>
            <span className="font-bold text-white">{count}</span>
          </span>
        ))}
      </div>
    );
  }

  // Separate quick reactions from custom reactions
  const quickReactionEmojis = quickReactions.map(r => r.emoji);
  const customReactions = reactions.filter(r => !quickReactionEmojis.includes(r.emoji) && r.count > 0);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Quick reactions */}
      {quickReactions.map(({ emoji, label }) => {
        const reaction = reactions.find(r => r.emoji === emoji);
        const count = reaction?.count || 0;
        const isActive = reaction?.hasReacted || false;
        
        return (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
              isActive 
                ? 'bg-blue-600/30 border-blue-500/60 text-blue-300 shadow-lg shadow-blue-600/30' 
                : 'bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15]'
            } ${loading ? 'cursor-wait' : ''}`}
            title={label}
          >
            <span className="text-xl">{emoji}</span>
            {count > 0 && (
              <span className="text-base font-bold text-white">{count}</span>
            )}
          </button>
        );
      })}

      {/* Custom reactions */}
      {customReactions.map(({ emoji, count, hasReacted }) => (
        <button
          key={emoji}
          onClick={() => handleEmojiClick(emoji)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
            hasReacted 
              ? 'bg-blue-600/30 border-blue-500/60 text-blue-300 shadow-lg shadow-blue-600/30' 
              : 'bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15]'
          } ${loading ? 'cursor-wait' : ''}`}
        >
          <span className="text-xl">{emoji}</span>
          <span className="text-base font-bold text-white">{count}</span>
        </button>
      ))}

      {/* Emoji Picker Button */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowPicker(!showPicker)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15] ${loading ? 'cursor-wait' : ''}`}
          title="Add any emoji"
        >
          <Smile className="w-5 h-5" />
          <span className="text-sm font-medium">More</span>
        </button>

        {/* Emoji Picker */}
        {showPicker && (
          <div className="absolute bottom-full mb-2 left-0 z-50">
            <Picker
              onEmojiClick={handleEmojiSelect}
              theme="dark"
              width={350}
              height={400}
              searchPlaceHolder="Search emoji..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
