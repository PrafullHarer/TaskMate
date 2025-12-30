import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/server/db';
import Task from '@/lib/server/models/Task';
import { protect } from '@/lib/server/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await protect(req);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const groupId = searchParams.get('groupId');

    let query: any = { user: authResult.user._id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (status) {
      query.status = status;
    }

    if (groupId) {
      query.group = groupId;
    }

    const tasks = await Task.find(query)
      .populate('group', 'name')
      .sort({ dueDate: -1, priority: -1 });

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching tasks',
        error: error.message
      },
      { status: 500 }
    );
  }
}

