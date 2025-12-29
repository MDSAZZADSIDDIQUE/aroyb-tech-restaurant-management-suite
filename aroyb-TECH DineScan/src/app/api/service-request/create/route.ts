import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { type, sessionId, tableId, tableName, locationId, guestName } = body;
  
  const requestId = `req-${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
  
  const serviceRequest = {
    id: requestId,
    type,
    sessionId,
    tableId,
    tableName,
    locationId,
    guestName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  return NextResponse.json({ success: true, request: serviceRequest });
}
