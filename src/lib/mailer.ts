import nodemailer from 'nodemailer';

function readSmtpPort() {
  const raw = process.env.SMTP_PORT;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : 587;
}

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: readSmtpPort(),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendMail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP not configured');
  }
  const transporter = createTransporter();
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
}) {
  await sendMail({
    to: params.to,
    subject: 'Reset your vena/verse password',
    text: [
      'You requested a password reset.',
      '',
      `Use this link to set a new password (valid for ${params.expiresInMinutes} minutes):`,
      params.resetUrl,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <p>You requested a password reset.</p>
      <p>
        Use this link to set a new password (valid for ${params.expiresInMinutes} minutes):
      </p>
      <p><a href="${params.resetUrl}">${params.resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
}
