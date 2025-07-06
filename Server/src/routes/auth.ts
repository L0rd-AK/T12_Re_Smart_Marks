import express from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  googleLoginSchema,
  refreshTokenSchema,
} from '../schemas/auth';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', 
  authLimiter,
  validateRequest(registerSchema), 
  AuthController.register
);

router.post('/login', 
  authLimiter,
  validateRequest(loginSchema), 
  AuthController.login
);

router.post('/google', 
  authLimiter,
  validateRequest(googleLoginSchema), 
  AuthController.googleLogin
);

router.post('/forgot-password', 
  authLimiter,
  validateRequest(forgotPasswordSchema), 
  AuthController.forgotPassword
);

router.post('/reset-password', 
  authLimiter,
  validateRequest(resetPasswordSchema), 
  AuthController.resetPassword
);

router.post('/verify-email', 
  generalLimiter,
  validateRequest(verifyEmailSchema), 
  AuthController.verifyEmail
);

router.post('/refresh', 
  generalLimiter,
  validateRequest(refreshTokenSchema), 
  AuthController.refreshToken
);

// Protected routes
router.post('/logout', 
  optionalAuth, 
  AuthController.logout
);

router.post('/resend-verification', 
  generalLimiter,
  authenticate, 
  AuthController.resendVerificationEmail
);

router.get('/me', 
  authenticate, 
  AuthController.getCurrentUser
);

router.put('/profile', 
  authenticate, 
  AuthController.updateProfile
);

export default router;
