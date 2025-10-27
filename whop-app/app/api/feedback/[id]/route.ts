import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserAuth } from '@/lib/auth';

// PATCH /api/feedback/[id] - Update message (mark as reviewed)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reviewed } = body;

    if (reviewed === undefined) {
      return NextResponse.json(
        { error: 'Missing reviewed field' },
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

    // Update only if message belongs to this company
    const { data, error } = await supabase
      .from('messages')
      .update({ reviewed })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Message not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH /api/feedback/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/feedback/[id] - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Delete only if message belongs to this company
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error deleting message:', error);
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/feedback/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

