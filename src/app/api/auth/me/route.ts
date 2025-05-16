export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers'; // Import cookies
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret'; // Use the same secret

interface UserPayload {
  id: number; // Matches the type in JWT payload and Prisma schema
  username: string;
}

export async function GET(req: NextRequest) {
  try {
    const token = cookies().get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }

    let userPayload: UserPayload;
    try {
      userPayload = jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch (error) {
      // If token is invalid (e.g., expired, wrong secret, malformed)
      console.error('JWT verification error in /api/auth/me:', error);
      return NextResponse.json({ message: 'session expired or invalid' }, { status: 401 }); // 401 for simplicity
    }

    const user = await prisma.user.findUnique({ 
      where: { id: userPayload.id },
      select: { // Select only the necessary fields to send to the client
        id: true,
        username: true,
        profileImage: true,
        createdAt: true,
        isAdmin: true,
      }
    });

    if (!user) {
      // This case might happen if user was deleted after token was issued
      return NextResponse.json({ message: 'user not found' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ message: 'an unexpected error occurred' }, { status: 500 });
  }
} 