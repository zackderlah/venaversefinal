export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildPasswordResetUrl, createPasswordResetToken } from '@/lib/passwordReset';

const GENERIC_RESPONSE = {
  message:
    'if an account exists for that email, a password reset link has been generated.',
};

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
    }

    const { rawToken, tokenHash, expiresAt } = createPasswordResetToken();
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = buildPasswordResetUrl(rawToken, req.nextUrl.origin);
    console.log(`[password-reset] ${user.email}: ${resetUrl}`);

    const includeDebugLink =
      process.env.NODE_ENV !== 'production' ||
      process.env.PASSWORD_RESET_DEBUG_LINK === 'true';

    return NextResponse.json(
      includeDebugLink ? { ...GENERIC_RESPONSE, resetUrl } : GENERIC_RESPONSE,
      { status: 200 }
    );
  } catch (error) {
    console.error('password reset request error:', error);
    return NextResponse.json(GENERIC_RESPONSE, { status: 200 });
  }
}
