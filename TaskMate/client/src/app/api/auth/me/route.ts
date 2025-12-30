import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/server/db';
import User from '@/lib/server/models/User';
import { protect } from '@/lib/server/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await protect(req);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = await User.findById(authResult.user._id).populate('groups', 'name description');

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching user',
        error: error.message
      },
      { status: 500 }
    );
  }
}

