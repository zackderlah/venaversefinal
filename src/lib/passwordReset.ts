import crypto from 'crypto';

const RESET_TOKEN_BYTES = 32;
export const PASSWORD_RESET_TTL_MINUTES = 30;

export function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
  return { rawToken, tokenHash, expiresAt };
}

export function hashResetToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function getResetBaseUrl(originFromRequest?: string) {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return originFromRequest || 'http://localhost:3000';
}

export function buildPasswordResetUrl(rawToken: string, originFromRequest?: string) {
  const base = getResetBaseUrl(originFromRequest).replace(/\/+$/, '');
  return `${base}/reset-password?token=${encodeURIComponent(rawToken)}`;
}
