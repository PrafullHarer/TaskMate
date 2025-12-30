import { NextRequest, NextResponse } from 'next/server';
import { protect } from '@/lib/server/middleware/auth';

export async function POST(req: NextRequest) {
  const authResult = await protect(req);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  // Clear the auth cookie
  response.cookies.delete('token');

  return response;
}

