import { NextResponse } from 'next/server';

// In-memory session store (for demo)
const sessions: Record<string, any> = {};

export async function POST(request: Request) {
  const body = await request.json();
  const { locationId, tableId } = body;
  
  const sessionId = `sess-${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
  
  const session = {
    sessionId,
    locationId,
    tableId,
    guests: [],
    createdAt: new Date().toISOString(),
    status: 'active',
  };
  
  sessions[sessionId] = session;
  
  return NextResponse.json({ success: true, session });
}
