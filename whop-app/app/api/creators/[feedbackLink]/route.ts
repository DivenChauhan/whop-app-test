import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/creators/[feedbackLink] - Get creator by feedback link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ feedbackLink: string }> }
) {
  try {
    const { feedbackLink } = await params;

    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('feedback_link', feedbackLink)
      .single();

    if (error) {
      console.error('Error fetching creator:', error);
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/creators/[feedbackLink]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

