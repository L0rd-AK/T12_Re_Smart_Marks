import { z } from 'zod';

// Register validation schema
export const registerSchema = z.object({
  body: z.object({
  name: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .trim(),
    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
});

// Login validation schema
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(1, 'Password is required')
  })
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim()
  })
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
});

// Verify email validation schema
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token is required')
  })
});

// Google login validation schema
export const googleLoginSchema = z.object({
  body: z.object({
    credential: z.string().min(1, 'Google credential is required')
  })
});

// Refresh token validation schema
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .trim()
      .optional(),
    employeeId: z
      .string()
      .max(20, 'Employee ID must be less than 20 characters')
      .trim()
      .optional(),
    designation: z
      .string()
      .max(100, 'Designation must be less than 100 characters')
      .trim()
      .optional(),
    emailId: z
      .string()
      .email('Please enter a valid email ID')
      .toLowerCase()
      .trim()
      .optional(),
    mobileNumber: z
      .string()
      .regex(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid mobile number')
      .trim()
      .optional(),
    roomNumber: z
      .string()
      .max(20, 'Room number must be less than 20 characters')
      .trim()
      .optional(),
    initial: z
      .string()
      .max(10, 'Initial must be less than 10 characters')
      .trim()
      .optional(),
    avatar: z
      .string()
      .url('Avatar must be a valid URL')
      .optional()
  })
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>['body'];
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
