import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/reactions - Add a reaction to a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, reactionType } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Missing message ID' },
        { status: 400 }
      );
    }

    const { data, error} = await supabase
      .from('reactions')
      .insert({
        message_id: messageId,
        reaction_type: reactionType || 'thumbs_up',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reaction:', error);
      return NextResponse.json(
        { error: 'Failed to create reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/reactions?messageId=xxx - Get reaction count for a message
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const { data, error, count } = await supabase
      .from('reactions')
      .select('*', { count: 'exact' })
      .eq('message_id', messageId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reactions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, count }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

