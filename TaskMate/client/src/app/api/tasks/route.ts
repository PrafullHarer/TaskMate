import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/server/db';
import Task from '@/lib/server/models/Task';
import { protect } from '@/lib/server/middleware/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const authResult = await protect(req);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { title, description, priority, effort, dueDate, group } = await req.json();

    const task = await Task.create({
      user: authResult.user._id,
      group,
      title,
      description,
      priority,
      effort,
      dueDate
    });

    // Note: Socket.io events would need to be handled separately
    // as Vercel serverless functions don't support persistent WebSocket connections

    return NextResponse.json({
      success: true,
      task
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating task',
        error: error.message
      },
      { status: 500 }
    );
  }
}

