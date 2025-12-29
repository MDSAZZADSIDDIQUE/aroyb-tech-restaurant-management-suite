import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { sessionId, locationId, tableId, items, subtotal, serviceCharge, total } = body;
  
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  const order = {
    orderId,
    sessionId,
    locationId,
    tableId,
    items,
    status: 'placed',
    coursesFired: [],
    coursesWaiting: [],
    subtotal,
    serviceCharge,
    total,
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
    timestamps: [{ status: 'placed', time: new Date().toISOString() }],
  };
  
  return NextResponse.json({ success: true, order });
}
