import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { sessionId, displayName, isHost } = body;
  
  const guestId = `guest-${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
  
  const guest = {
    guestId,
    displayName,
    joinedAt: new Date().toISOString(),
    isHost: isHost || false,
  };
  
  return NextResponse.json({ success: true, guest });
}
