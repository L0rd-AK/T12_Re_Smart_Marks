import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class JWTService {
  // Generate access token
  static generateAccessToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    };

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not defined');

    const options = {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d'
    } as SignOptions;

    return jwt.sign(payload, secret, options);
  }

  // Generate refresh token
  static generateRefreshToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    };

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');

    const options = {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    } as SignOptions;

    return jwt.sign(payload, secret, options);
  }

  // Generate email verification token
  static generateEmailVerificationToken(userId: string): string {
    const secret = process.env.JWT_EMAIL_VERIFICATION_SECRET;
    if (!secret) throw new Error('JWT_EMAIL_VERIFICATION_SECRET is not defined');

    const options: SignOptions = {
      expiresIn: '24h'
    };

    return jwt.sign({ userId }, secret, options);
  }

  // Generate password reset token
  static generatePasswordResetToken(userId: string): string {
    const secret = process.env.JWT_PASSWORD_RESET_SECRET;
    if (!secret) throw new Error('JWT_PASSWORD_RESET_SECRET is not defined');

    const options: SignOptions = {
      expiresIn: '10m'
    };

    return jwt.sign({ userId }, secret, options);
  }

  // Verify access token
  static verifyAccessToken(token: string): JWTPayload {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not defined');
    
    return jwt.verify(token, secret) as JWTPayload;
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): JWTPayload {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');
    
    return jwt.verify(token, secret) as JWTPayload;
  }

  // Verify email verification token
  static verifyEmailVerificationToken(token: string): { userId: string } {
    const secret = process.env.JWT_EMAIL_VERIFICATION_SECRET;
    if (!secret) throw new Error('JWT_EMAIL_VERIFICATION_SECRET is not defined');
    
    return jwt.verify(token, secret) as { userId: string };
  }

  // Verify password reset token
  static verifyPasswordResetToken(token: string): { userId: string } {
    const secret = process.env.JWT_PASSWORD_RESET_SECRET;
    if (!secret) throw new Error('JWT_PASSWORD_RESET_SECRET is not defined');
    
    return jwt.verify(token, secret) as { userId: string };
  }

  // Generate token pair
  static generateTokenPair(user: IUser): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user)
    };
  }
}
