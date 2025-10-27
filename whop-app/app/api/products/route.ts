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

    // Try multiple API endpoints since Whop's product API structure varies
    const endpointsToTry = [
      `https://api.whop.com/api/v5/companies/${companyId}/products`,
      `https://api.whop.com/api/v5/plans?company_id=${companyId}`,
      `https://api.whop.com/api/v2/products?company_id=${companyId}`,
      `https://api.whop.com/api/v5/experiences?company_id=${companyId}`,
      `https://api.whop.com/api/v5/products?company_id=${companyId}`,
    ];

    let data = null;
    let lastError = null;

    for (const endpoint of endpointsToTry) {
      try {
        console.log('Trying endpoint:', endpoint);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          data = await response.json();
          console.log('✅ Success! Endpoint worked:', endpoint);
          console.log('Products fetched:', data.data?.length || 0);
          break; // Found a working endpoint
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log(`❌ ${response.status} at ${endpoint}:`, errorData);
          lastError = { status: response.status, details: errorData, endpoint };
        }
      } catch (err) {
        console.log(`❌ Error at ${endpoint}:`, err);
        lastError = { error: err, endpoint };
      }
    }

    // If no endpoint worked, return the last error
    if (!data) {
      console.error('All product API endpoints failed. Last error:', lastError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch products from Whop - tried multiple endpoints',
          lastError,
          triedEndpoints: endpointsToTry
        },
        { status: lastError?.status || 500 }
      );
    }

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

