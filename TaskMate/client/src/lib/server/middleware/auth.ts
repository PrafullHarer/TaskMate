import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import connectDB from '../db';

export interface AuthenticatedRequest extends NextRequest {
  user?: any;
}

export async function protect(req: NextRequest): Promise<{ user: any } | NextResponse> {
  try {
    await connectDB();
    
    let token: string | undefined;

    // Check for token in Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    // Check for token in cookies
    if (!token) {
      token = req.cookies.get('token')?.value;
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authorized to access this route'
        },
        { status: 401 }
      );
    }

    try {
      // Verify token
      const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
      const decoded = jwt.verify(token, secret) as { id: string; username: string };

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: 'User not found'
          },
          { status: 401 }
        );
      }

      return { user };
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token is invalid or expired'
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Server error'
      },
      { status: 500 }
    );
  }
}

export async function platformAdmin(req: NextRequest): Promise<{ user: any } | NextResponse> {
  const authResult = await protect(req);
  if (authResult instanceof NextResponse) return authResult;

  if (!authResult.user || !authResult.user.isAdmin) {
    return NextResponse.json(
      {
        success: false,
        message: 'Access denied. Admin only.'
      },
      { status: 403 }
    );
  }

  return authResult;
}

