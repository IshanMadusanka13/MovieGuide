import { NextResponse } from 'next/server';
import { dbConnect } from '@/utils/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ username }).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check password (plain text comparison - consider hashing in production)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Return success with user info
    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        id: user._id
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { 
        success: false,
        error: 'Login failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}