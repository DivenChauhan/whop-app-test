import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserAuth } from '@/lib/auth';

// POST /api/feedback - Submit new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorId, message, tag, productCategory } = body;

    if (!creatorId || !message || !tag) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const { data, error } = await supabase
      .from('messages')
      .insert({
        creator_id: creatorId,
        company_id: companyId,
        message,
        tag,
        product_category: productCategory || null,
        reviewed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json(
        { error: 'Failed to create message' },
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

// GET /api/feedback?creatorId=xxx&reviewed=true/false&tag=xxx&productCategory=xxx&productId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get('creatorId');
    const reviewedFilter = searchParams.get('reviewed');
    const tagFilter = searchParams.get('tag');
    const productCategoryFilter = searchParams.get('productCategory');

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

    // Verify user has access to this company
    const auth = await getUserAuth();
    if (!auth.hasCompanyAccess) {
      return NextResponse.json(
        { error: 'Unauthorized: No access to this company' },
        { status: 403 }
      );
    }

    let query = supabase
      .from('messages')
      .select(`
        *,
        reply:replies(*)
      `)
      .eq('creator_id', creatorId)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (reviewedFilter !== null) {
      query = query.eq('reviewed', reviewedFilter === 'true');
    }

    if (tagFilter) {
      query = query.eq('tag', tagFilter);
    }

    if (productCategoryFilter) {
      query = query.eq('product_category', productCategoryFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
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

