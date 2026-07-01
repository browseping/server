import { AuthProvider } from '@prisma/client';

type AuthFields = {
  authProvider: AuthProvider;
  password: string | null;
  googleId?: string | null;
};

export const isGoogleOnlyUser = (user: AuthFields): boolean =>
  user.authProvider === AuthProvider.GOOGLE && !user.password;

export const hasPasswordLogin = (user: AuthFields): boolean => Boolean(user.password);

export const googleAccountLinked = (user: AuthFields): boolean => Boolean(user.googleId);
