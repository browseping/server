import crypto from 'crypto';

const MAX_IDENTIFIER_LENGTH = 320;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmailIdentifier(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

export function normalizeLoginIdentifier(identifier: unknown): string | null {
  if (typeof identifier !== 'string') {
    return null;
  }

  const trimmed = identifier.trim();
  if (!trimmed) {
    return null;
  }

  let normalized = trimmed.includes('@') ? normalizeEmail(trimmed) : trimmed;

  if (normalized.length > MAX_IDENTIFIER_LENGTH) {
    normalized = crypto.createHash('sha256').update(normalized).digest('hex');
  }

  return normalized;
}

export function hashIdentifierForLog(identifier: string): string {
  return crypto.createHash('sha256').update(identifier).digest('hex').slice(0, 8);
}
