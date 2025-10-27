import { NextRequest, NextResponse } from 'next/server';

// GET /api/products - Get all products for the company
export async function GET(request: NextRequest) {
  try {
    // Get company ID from environment (set by Whop for this app installation)
    const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    const apiKey = process.env.WHOP_API_KEY;
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company configuration missing' },
        { status: 500 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key missing' },
        { status: 500 }
      );
    }

    console.log('Fetching products for company:', companyId);

    // Call Whop API directly since SDK doesn't support products yet
    const whopApiUrl = `https://api.whop.com/api/v5/products?company_id=${companyId}&per=100`;
    
    const response = await fetch(whopApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Whop API Error:', response.status, errorData);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch products from Whop',
          status: response.status,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Products fetched successfully:', data.data?.length || 0);

    // Transform to match our expected format
    const formattedProducts = (data.data || []).map((product: any) => ({
      id: product.id,
      name: product.name || product.title,
      visibility: product.visibility,
      created_at: product.created_at,
    }));

    return NextResponse.json({ 
      data: formattedProducts,
      total: data.pagination?.total_count || formattedProducts.length 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching products from Whop:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

