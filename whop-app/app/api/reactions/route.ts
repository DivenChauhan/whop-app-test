import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/reactions - Add a reaction to a message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, reactionType, userHash } = body;

    if (!messageId || !userHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get company ID from environment
    const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company configuration missing' },
        { status: 500 }
      );
    }

    // Verify the message belongs to this company
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id, company_id')
      .eq('id', messageId)
      .eq('company_id', companyId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Message not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check if user already reacted with this emoji
    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('reaction_type', reactionType || '👍')
      .eq('user_hash', userHash)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'User already reacted with this emoji' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('reactions')
      .insert({
        message_id: messageId,
        reaction_type: reactionType || '👍',
        user_hash: userHash,
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

// GET /api/reactions?messageId=xxx&userHash=xxx - Get reactions for a message
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

    // Get company ID from environment
    const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company configuration missing' },
        { status: 500 }
      );
    }

    // Verify the message belongs to this company
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id, company_id')
      .eq('id', messageId)
      .eq('company_id', companyId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Message not found or unauthorized' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('message_id', messageId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reactions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/reactions - Remove a reaction
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, emoji, userHash } = body;

    if (!messageId || !emoji || !userHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get company ID from environment
    const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company configuration missing' },
        { status: 500 }
      );
    }

    // Verify the message belongs to this company
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id, company_id')
      .eq('id', messageId)
      .eq('company_id', companyId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Message not found or unauthorized' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('reaction_type', emoji)
      .eq('user_hash', userHash);

    if (error) {
      console.error('Error deleting reaction:', error);
      return NextResponse.json(
        { error: 'Failed to delete reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

