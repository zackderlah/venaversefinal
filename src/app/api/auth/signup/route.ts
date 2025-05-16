export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email, username, password } = await req.json();
  
  if (!email || !username || !password || password.length < 6) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Check if email or username is already taken
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return NextResponse.json({ error: 'Email already taken' }, { status: 409 });
    }
    if (existingUser.username === username) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { 
      email,
      username, 
      password: hashed 
    },
  });

  return NextResponse.json({ id: user.id, username: user.username });
} 