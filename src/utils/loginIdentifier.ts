import crypto from 'crypto';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmailIdentifier(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

export function hashIdentifierForLog(identifier: string): string {
  return crypto.createHash('sha256').update(identifier).digest('hex').slice(0, 8);
}
