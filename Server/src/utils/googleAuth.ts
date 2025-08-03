import { OAuth2Client } from 'google-auth-library';

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
  emailVerified: boolean;
}

export class GoogleAuthService {
  private static client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // Verify Google ID token
  static async verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        throw new Error('Invalid Google token payload');
      }

      if (!payload.email || !payload.given_name || !payload.family_name) {
        throw new Error('Missing required user information from Google');
      }

      return {
        email: payload.email,
        name: payload.given_name,
        // lastName: payload.family_name,
        picture: payload.picture,
        googleId: payload.sub,
        emailVerified: payload.email_verified || false,
      };
    } catch (error) {
      console.error('Google token verification error:', error);
      throw new Error('Invalid Google token');
    }
  }
}
