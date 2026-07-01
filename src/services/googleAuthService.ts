import { OAuth2Client } from 'google-auth-library';
import { normalizeEmail } from '../utils/loginIdentifier';

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string | null;
  picture: string | null;
  emailVerified: boolean;
}

let oauthClient: OAuth2Client | null = null;

const getOAuthClient = (): OAuth2Client => {
  if (!oauthClient) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not configured');
    }
    oauthClient = new OAuth2Client(clientId);
  }
  return oauthClient;
};

export const verifyGoogleIdToken = async (idToken: string): Promise<GoogleUserProfile> => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const ticket = await getOAuthClient().verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub) {
    throw new Error('Invalid Google ID token');
  }

  if (!payload.email) {
    throw new Error('Google account email is not available');
  }

  return {
    googleId: payload.sub,
    email: normalizeEmail(payload.email),
    name: payload.name ?? null,
    picture: payload.picture ?? null,
    emailVerified: payload.email_verified === true,
  };
};
