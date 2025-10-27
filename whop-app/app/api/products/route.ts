import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop-sdk';

// GET /api/products - Get all products for the company
export async function GET(request: NextRequest) {
  try {
    // Get company ID from environment (set by Whop for this app installation)
    const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company configuration missing' },
        { status: 500 }
      );
    }

    // Fetch products from Whop for this company
    const products = await whopSdk.products.listProducts({
      companyId,
      page: 1,
      per: 100, // Get up to 100 products
    });

    // Transform to a simpler format for the frontend
    const formattedProducts = products.data.map((product) => ({
      id: product.id,
      name: product.name,
      visibility: product.visibility,
      created_at: product.created_at,
    }));

    return NextResponse.json({ 
      data: formattedProducts,
      total: products.pagination?.total_count || formattedProducts.length 
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products from Whop:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

