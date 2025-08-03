import nodemailer from 'nodemailer';
import { IUser } from '../models/User';
import dotenv from 'dotenv';
dotenv.config()
export class EmailService {
    private static transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Send email verification
    static async sendEmailVerification(user: IUser, token: string): Promise<void> {
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

        const mailOptions = {
            from: `"Smart Marks" <${process.env.EMAIL_FROM}>`,
            to: user.email,
            subject: 'Verify Your Email Address',
            html: this.getEmailVerificationTemplate(user.name, verificationUrl),
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Email verification sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending email verification:', error);
            throw new Error('Failed to send verification email');
        }
    }

    // Send password reset email
    static async sendPasswordReset(user: IUser, token: string): Promise<void> {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"Smart Marks" <${process.env.EMAIL_FROM}>`,
            to: user.email,
            subject: 'Password Reset Request',
            html: this.getPasswordResetTemplate(user.name, resetUrl),
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Password reset email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    // Send welcome email
    static async sendWelcomeEmail(user: IUser): Promise<void> {
        const mailOptions = {
            from: `"Smart Marks" <${process.env.EMAIL_FROM}>`,
            to: user.email,
            subject: 'Welcome to Smart Marks!',
            html: this.getWelcomeTemplate(user.name),
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Welcome email sent to ${user.email}`);
        } catch (error) {
            console.error('Error sending welcome email:', error);
            // Don't throw error for welcome email as it's not critical
        }
    }

    // Email verification template
    private static getEmailVerificationTemplate(name: string, verificationUrl: string): string {
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Smart Marks</h1>
          <h2>Verify Your Email Address</h2>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for registering with Smart Marks! To complete your registration and start using our platform, please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account with Smart Marks, please ignore this email.</p>
          <p>Best regards,<br>The Smart Marks Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Smart Marks. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
    }

    // Password reset template
    private static getPasswordResetTemplate(name: string, resetUrl: string): string {
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Smart Marks</h1>
          <h2>Password Reset Request</h2>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We received a request to reset your password for your Smart Marks account. Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
          <p><strong>This link will expire in 10 minutes for security reasons.</strong></p>
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          <p>Best regards,<br>The Smart Marks Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Smart Marks. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
    }

    // Welcome email template
    private static getWelcomeTemplate(name: string): string {
        return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Smart Marks</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Smart Marks!</h1>
          <p>Your journey to better grade management starts here</p>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Welcome to Smart Marks! We're excited to have you on board. Your email has been verified and your account is now active.</p>
          
          <h3>What you can do with Smart Marks:</h3>
          
          <div class="feature">
            <h4>📊 Track Academic Performance</h4>
            <p>Monitor quiz, midterm, and final exam scores with detailed analytics.</p>
          </div>
          
          <div class="feature">
            <h4>📈 Grade Management</h4>
            <p>Efficiently manage and calculate grades with our intelligent system.</p>
          </div>
          
          <div class="feature">
            <h4>📱 Mobile-Friendly Interface</h4>
            <p>Access your grades anytime, anywhere with our responsive design.</p>
          </div>
          
          <p>Ready to get started? <a href="${process.env.CLIENT_URL}" style="color: #667eea;">Log in to your account</a> and explore all the features Smart Marks has to offer.</p>
          
          <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
          
          <p>Best regards,<br>The Smart Marks Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Smart Marks. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
    }
}
