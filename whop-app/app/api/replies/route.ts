import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/replies - Create a reply to a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, replyText, isPublic } = body;

    if (!messageId || !replyText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('replies')
      .insert({
        message_id: messageId,
        reply_text: replyText,
        is_public: isPublic ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reply:', error);
      return NextResponse.json(
        { error: 'Failed to create reply' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/replies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/replies?messageId=xxx&publicOnly=true/false
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('messageId');
    const publicOnly = searchParams.get('publicOnly');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('replies')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: false });

    if (publicOnly === 'true') {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching replies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch replies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/replies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

