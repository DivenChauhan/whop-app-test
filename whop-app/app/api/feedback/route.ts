import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/feedback - Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorId, message, sentiment } = body;

    if (!creatorId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        creator_id: creatorId,
        message,
        sentiment: sentiment || 'neutral',
        reviewed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feedback:', error);
      return NextResponse.json(
        { error: 'Failed to create feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/feedback?creatorId=xxx&reviewed=true/false
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get('creatorId');
    const reviewedFilter = searchParams.get('reviewed');
    const sentimentFilter = searchParams.get('sentiment');

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('feedback')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (reviewedFilter !== null) {
      query = query.eq('reviewed', reviewedFilter === 'true');
    }

    if (sentimentFilter) {
      query = query.eq('sentiment', sentimentFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

