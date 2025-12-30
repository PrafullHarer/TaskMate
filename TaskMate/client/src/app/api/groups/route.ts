import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/server/db';
import Group from '@/lib/server/models/Group';
import User from '@/lib/server/models/User';
import { protect } from '@/lib/server/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await protect(req);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const groups = await Group.find({
      members: authResult.user._id
    })
      .populate('admin', 'name username profilePicture')
      .populate('members', 'name username profilePicture weeklyCoins groupCoins');

    // Transform members to use group-specific coins
    const groupsWithStats = groups.map(group => {
      const groupObj = group.toObject();
      groupObj.members = groupObj.members.map((member: any) => {
        const groupCoins = member.groupCoins?.find((gc: any) => gc.group.toString() === group._id.toString());
        return {
          ...member,
          weeklyCoins: groupCoins ? groupCoins.weeklyCoins : 0
        };
      });
      return groupObj;
    });

    return NextResponse.json({
      success: true,
      count: groupsWithStats.length,
      groups: groupsWithStats
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching groups',
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await protect(req);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { name, description, settings } = await req.json();

    const group = await Group.create({
      name,
      description,
      admin: authResult.user._id,
      members: [authResult.user._id],
      settings
    });

    // Add group to user's groups and initialize coins
    await User.findByIdAndUpdate(authResult.user._id, {
      $push: {
        groups: group._id,
        groupCoins: {
          group: group._id,
          weeklyCoins: 0,
          lifetimeCoins: 0
        }
      }
    });

    return NextResponse.json({
      success: true,
      group
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating group',
        error: error.message
      },
      { status: 500 }
    );
  }
}

