import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'authentication required' }, { status: 401 });
    }

    // Return only the necessary fields to the client
    return NextResponse.json({
      id: session.user.id,
      username: session.user.name,
      email: session.user.email,
      image: session.user.image,
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ message: 'an unexpected error occurred' }, { status: 500 });
  }
} 