import { Request, Response } from 'express';
import User from '../models/User';
import { JWTService } from '../utils/jwt';
import { EmailService } from '../utils/email';
import { GoogleAuthService } from '../utils/googleAuth';
import { createError, asyncHandler } from '../middleware/errorHandler';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  GoogleLoginInput,
  RefreshTokenInput,
} from '../schemas/auth';

export class AuthController {
  // Register new user
  static register = asyncHandler(async (req: Request<{}, {}, RegisterInput>, res: Response) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError('User with this email already exists', 400);
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    // Generate email verification token
    const verificationToken = JWTService.generateEmailVerificationToken(user._id as string);

    await user.save();

    // Send verification email
    try {
      await EmailService.sendEmailVerification(user, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error, user is still created
    }

    // Generate tokens
    const { accessToken, refreshToken } = JWTService.generateTokenPair(user);

    // Save refresh token to user
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict to lax for better compatibility
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict to lax for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user,
      accessToken,
      refreshToken,
    });
  });

  // Login user
  static login = asyncHandler(async (req: Request<{}, {}, LoginInput>, res: Response) => {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password +refreshTokens');

    if (!user || !(await user.comparePassword(password))) {
      throw createError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const { accessToken, refreshToken } = JWTService.generateTokenPair(user);

    // Clean up old refresh tokens (keep only last 5)
    user.refreshTokens = user.refreshTokens.slice(-4);
    user.refreshTokens.push(refreshToken);

    await user.save();

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict to lax for better compatibility
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict to lax for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user,
      accessToken,
      refreshToken,
    });
  });

  // Google OAuth login
  static googleLogin = asyncHandler(async (req: Request<{}, {}, GoogleLoginInput>, res: Response) => {
    const { credential } = req.body;

    // Verify Google token
    const googleUser = await GoogleAuthService.verifyGoogleToken(credential);

    // Check if user exists
    let user = await User.findOne({
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.googleId }
      ]
    }).select('+refreshTokens');

    if (user) {
      // Update existing user
      if (!user.googleId) {
        user.googleId = googleUser.googleId;
      }
      if (!user.isEmailVerified && googleUser.emailVerified) {
        user.isEmailVerified = true;
      }
      if (googleUser.picture && !user.avatar) {
        user.avatar = googleUser.picture;
      }
      user.lastLogin = new Date();
    } else {
      // Create new user
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        avatar: googleUser.picture,
        isEmailVerified: googleUser.emailVerified,
        lastLogin: new Date(),
      });

      // Send welcome email
      try {
        await EmailService.sendWelcomeEmail(user);
      } catch (error) {
        console.error('Failed to send welcome email:', error);
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = JWTService.generateTokenPair(user);

    // Clean up old refresh tokens
    user.refreshTokens = user.refreshTokens.slice(-4);
    user.refreshTokens.push(refreshToken);

    await user.save();

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict to lax for better compatibility
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict to lax for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Google login successful',
      user,
      accessToken,
      refreshToken,
    });
  });

  // Logout user
  static logout = asyncHandler(async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (refreshToken && req.user && Array.isArray(req.user.refreshTokens)) {
        // Remove refresh token from user
        req.user.refreshTokens = req.user.refreshTokens.filter(token => token !== refreshToken);
        await req.user.save();
      }

      // Clear cookies regardless of user state
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      res.json({ 
        success: true,
        message: 'Logout successful' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear cookies and respond successfully
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.json({ 
        success: true,
        message: 'Logout successful' 
      });
    }
  });

  // Refresh access token
  static refreshToken = asyncHandler(async (req: Request<{}, {}, RefreshTokenInput>, res: Response) => {
    const { refreshToken } = req.body;
    const cookieRefreshToken = req.cookies.refreshToken;

    const token = refreshToken || cookieRefreshToken;

    if (!token) {
      throw createError('Refresh token required', 401);
    }

    // Verify refresh token
    const decoded = JWTService.verifyRefreshToken(token);

    // Find user and check if refresh token is valid
    const user = await User.findById(decoded.userId).select('+refreshTokens');

    if (!user || !user.refreshTokens.includes(token)) {
      throw createError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = JWTService.generateTokenPair(user);

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    // Set new cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict to lax for better compatibility
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from strict to lax for better compatibility
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken,
    });
  });

  // Forgot password
  static forgotPassword = asyncHandler(async (req: Request<{}, {}, ForgotPasswordInput>, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate password reset token
    const resetToken = JWTService.generatePasswordResetToken(user._id as string);

    // Send password reset email
    try {
      await EmailService.sendPasswordReset(user, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw createError('Failed to send password reset email', 500);
    }

    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  });

  // Reset password
  static resetPassword = asyncHandler(async (req: Request<{}, {}, ResetPasswordInput>, res: Response) => {
    const { token, password } = req.body;

    // Verify reset token
    const decoded = JWTService.verifyPasswordResetToken(token);

    const user = await User.findById(decoded.userId).select('+refreshTokens');

    if (!user) {
      throw createError('Invalid or expired reset token', 400);
    }

    // Update password
    user.password = password;

    // Clear all refresh tokens (force re-login on all devices)
    user.refreshTokens = [];

    await user.save();

    res.json({ message: 'Password reset successful. Please log in with your new password.' });
  });

  // Verify email
  static verifyEmail = asyncHandler(async (req: Request<{}, {}, VerifyEmailInput>, res: Response) => {
    const { token } = req.body;

    // Verify email verification token
    const decoded = JWTService.verifyEmailVerificationToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw createError('Invalid or expired verification token', 400);
    }

    if (user.isEmailVerified) {
      return res.json({ message: 'Email is already verified' });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    await user.save();

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    res.json({ message: 'Email verified successfully' });
  });

  // Resend email verification
  static resendVerificationEmail = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw createError('Authentication required', 401);
    }

    if (user.isEmailVerified) {
      return res.json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = JWTService.generateEmailVerificationToken(user._id as string);

    // Send verification email
    try {
      await EmailService.sendEmailVerification(user, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw createError('Failed to send verification email', 500);
    }

    res.json({ message: 'Verification email sent successfully' });
  });

  // Get current user
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  // Update profile
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { 
      name, 
      employeeId, 
      designation, 
      emailId, 
      mobileNumber, 
      roomNumber, 
      initial,
      avatar 
    } = req.body;
    const user = req.user!;

    if (name) user.name = name;
    if (employeeId !== undefined) user.employeeId = employeeId;
    if (designation !== undefined) user.designation = designation;
    if (emailId !== undefined) user.emailId = emailId;
    if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;
    if (roomNumber !== undefined) user.roomNumber = roomNumber;
    if (initial !== undefined) user.initial = initial;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  });
}
