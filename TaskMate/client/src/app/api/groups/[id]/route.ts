import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/server/db';
import Group from '@/lib/server/models/Group';
import { isMember } from '@/lib/server/middleware/group';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const memberResult = await isMember(req, params.id);
    
    if (memberResult instanceof NextResponse) {
      return memberResult;
    }

    const group = await Group.findById(params.id)
      .populate('admin', 'name username profilePicture')
      .populate('members', 'name username profilePicture weeklyCoins lifetimeCoins')
      .populate('pendingRequests.user', 'name username profilePicture');

    return NextResponse.json({
      success: true,
      group
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching group',
        error: error.message
      },
      { status: 500 }
    );
  }
}

