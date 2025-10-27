import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/feed?creatorId=xxx&tag=xxx - Get public feed (all messages sorted by reactions)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get('creatorId');
    const tag = searchParams.get('tag');

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    // Get company ID from environment (set by Whop for this app installation)
    const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company configuration missing' },
        { status: 500 }
      );
    }

    // Build query for all messages (replies will be filtered client-side)
    let query = supabase
      .from('messages')
      .select(`
        *,
        replies(*)
      `)
      .eq('creator_id', creatorId)
      .eq('company_id', companyId);

    // Apply tag filter if provided
    if (tag && tag !== 'all') {
      query = query.eq('tag', tag);
    }

    query = query.order('created_at', { ascending: false });

    const { data: messages, error: messagesError } = await query;

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Filter replies to only public ones and get reaction counts
    const messagesWithReactions = await Promise.all(
      (messages || []).map(async (message: any) => {
        const { count } = await supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('message_id', message.id);

        // Filter to only show public replies in the feed
        const publicReplies = (message.replies || []).filter((reply: any) => reply.is_public === true);

        return {
          ...message,
          replies: publicReplies,
          reaction_count: count || 0,
        };
      })
    );

    // Sort by reaction count (hottest first), then by created_at
    const sortedMessages = messagesWithReactions.sort((a, b) => {
      if (b.reaction_count !== a.reaction_count) {
        return b.reaction_count - a.reaction_count; // Higher reactions first
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Newer first if same reactions
    });

    return NextResponse.json({ data: sortedMessages }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

