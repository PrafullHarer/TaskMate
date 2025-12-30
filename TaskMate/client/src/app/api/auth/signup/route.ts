import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/server/db';
import User from '@/lib/server/models/User';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, username, email, password } = await req.json();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken'
        },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password
    });

    // Generate token
    const token = user.generateAuthToken();

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        weeklyCoins: user.weeklyCoins,
        lifetimeCoins: user.lifetimeCoins,
        achievements: user.achievements
      }
    }, { status: 201 });

    // Set HTTP-only cookie
    response.cookies.set('token', token, COOKIE_OPTIONS);

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating account',
        error: error.message
      },
      { status: 500 }
    );
  }
}

