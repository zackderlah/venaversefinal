export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hashResetToken } from '@/lib/passwordReset';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    const rawToken = String(token ?? '').trim();
    const nextPassword = String(password ?? '');

    if (!rawToken) {
      return NextResponse.json({ error: 'invalid or expired reset link' }, { status: 400 });
    }
    if (!nextPassword || nextPassword.length < 6) {
      return NextResponse.json(
        { error: 'password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const tokenHash = hashResetToken(rawToken);
    const now = new Date();
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
      return NextResponse.json({ error: 'invalid or expired reset link' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(nextPassword, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: now },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId, id: { not: resetToken.id } },
      }),
    ]);

    return NextResponse.json({ message: 'password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('password reset confirm error:', error);
    return NextResponse.json({ error: 'unable to reset password' }, { status: 500 });
  }
}
