export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password || password.length < 6) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashed },
  });
  return NextResponse.json({ id: user.id, username: user.username });
} 