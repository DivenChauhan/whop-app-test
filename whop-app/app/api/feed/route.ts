import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/feed?creatorId=xxx - Get public feed (messages with public replies and reaction counts)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    // Get messages with public replies
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        replies!inner(*)
      `)
      .eq('creator_id', creatorId)
      .eq('replies.is_public', true)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Get reaction counts for each message
    const messagesWithReactions = await Promise.all(
      (messages || []).map(async (message: any) => {
        const { count } = await supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('message_id', message.id);

        return {
          ...message,
          reaction_count: count || 0,
        };
      })
    );

    return NextResponse.json({ data: messagesWithReactions }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

