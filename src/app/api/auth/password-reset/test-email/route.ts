export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { isSmtpConfigured, sendMail } from '@/lib/mailer';

function isAllowed() {
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_TEST_EMAIL_ENDPOINT === 'true'
  );
}

export async function POST(req: NextRequest) {
  if (!isAllowed()) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  if (!isSmtpConfigured()) {
    return NextResponse.json(
      {
        error:
          'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM.',
      },
      { status: 400 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const to = String(body?.to ?? process.env.SMTP_USER ?? '').trim();
    if (!to || !to.includes('@')) {
      return NextResponse.json(
        { error: 'provide a valid email in body: { \"to\": \"you@example.com\" }' },
        { status: 400 }
      );
    }

    await sendMail({
      to,
      subject: 'vena/verse SMTP test email',
      text: 'This is a test email from vena/verse password reset setup.',
      html: '<p>This is a test email from vena/verse password reset setup.</p>',
    });

    return NextResponse.json({ message: `test email sent to ${to}` }, { status: 200 });
  } catch (error) {
    console.error('test-email route error:', error);
    return NextResponse.json({ error: 'failed to send test email' }, { status: 500 });
  }
}
