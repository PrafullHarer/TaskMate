import { NextRequest, NextResponse } from 'next/server';
import Group from '../models/Group';
import { protect } from './auth';

export async function isMember(req: NextRequest, groupId: string): Promise<{ user: any; group: any } | NextResponse> {
  const authResult = await protect(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const group = await Group.findById(groupId);
    
    if (!group) {
      return NextResponse.json(
        {
          success: false,
          message: 'Group not found'
        },
        { status: 404 }
      );
    }

    const userId = authResult.user._id.toString();
    
    if (!group.isMember(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied. Group members only.'
        },
        { status: 403 }
      );
    }

    return { user: authResult.user, group };
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error checking group membership'
      },
      { status: 500 }
    );
  }
}

export async function isGroupAdmin(req: NextRequest, groupId: string): Promise<{ user: any; group: any } | NextResponse> {
  const memberResult = await isMember(req, groupId);
  if (memberResult instanceof NextResponse) return memberResult;

  const userId = memberResult.user._id.toString();

  if (!memberResult.group.isAdmin(userId)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Access denied. Group admin only.'
      },
      { status: 403 }
    );
  }

  return memberResult;
}

