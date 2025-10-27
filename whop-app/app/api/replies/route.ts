import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserAuth } from '@/lib/auth';

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

    // Get company ID from environment
    const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company configuration missing' },
        { status: 500 }
      );
    }

    // Verify user is a creator with access to this company
    const auth = await getUserAuth();
    if (!auth.isCreator || !auth.hasCompanyAccess) {
      return NextResponse.json(
        { error: 'Unauthorized: Creator access required' },
        { status: 403 }
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
      .from('replies')
      .insert({
        message_id: messageId,
        reply_text: replyText,
        is_public: isPublic ?? true, // Default to public (true) if not specified
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

