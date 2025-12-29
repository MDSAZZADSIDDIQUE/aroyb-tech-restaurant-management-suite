import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  
  // In demo, return mock status
  // In production, this would query the database
  return NextResponse.json({
    orderId,
    status: 'in-kitchen',
    estimatedReady: new Date(Date.now() + 15 * 60000).toISOString(),
  });
}
