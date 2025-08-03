import express, { Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import User from '../models/User';
import { createError, asyncHandler } from '../middleware/errorHandler';
import mongoose from 'mongoose';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole(['admin']));

// User Management Routes
// Get all users with filtering and pagination
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, role, isBlocked } = req.query as any;

  const filter: any = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (isBlocked !== undefined) {
    filter.isBlocked = isBlocked === 'true';
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
      .populate('blockedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  res.json({
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get user statistics
router.get('/users/stats', asyncHandler(async (req: Request, res: Response) => {
  const [totalUsers, activeUsers, blockedUsers, adminUsers, teacherUsers, moduleLeaderUsers, regularUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isBlocked: false }),
    User.countDocuments({ isBlocked: true }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'module-leader' }),
    User.countDocuments({ role: 'user' })
  ]);

  res.json({
    totalUsers,
    activeUsers,
    blockedUsers,
    adminUsers,
    teacherUsers,
    moduleLeaderUsers,
    regularUsers
  });
}));

// Update user role
router.put('/users/:id/role', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body.data || req.body;
  const adminId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid user ID', 400);
  }

  // Prevent admin from changing their own role
  if (id === adminId) {
    throw createError('Cannot change your own role', 400);
  }

  // Validate role value
  const validRoles = ['user', 'admin', 'teacher', 'module-leader'];
  if (!role || !validRoles.includes(role)) {
    throw createError('Invalid or missing role', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw createError('User not found', 404);
  }

  user.role = role;
  await user.save();

  const updatedUser = await User.findById(id)
    .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
    .populate('blockedBy', 'name email');

  res.json({
    message: 'User role updated successfully',
    user: updatedUser
  });
}));

// Block user
router.put('/users/:id/block', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body.data || req.body;
  const adminId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid user ID', 400);
  }

  // Prevent admin from blocking themselves
  if (id === adminId) {
    throw createError('Cannot block yourself', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.isBlocked) {
    throw createError('User is already blocked', 400);
  }

  user.isBlocked = true;
  user.blockedAt = new Date();
  user.blockedBy = new mongoose.Types.ObjectId(adminId);
  user.blockReason = reason;
  await user.save();

  const updatedUser = await User.findById(id)
    .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
    .populate('blockedBy', 'name email');

  res.json({
    message: 'User blocked successfully',
    user: updatedUser
  });
}));

// Unblock user
router.put('/users/:id/unblock', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid user ID', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw createError('User not found', 404);
  }

  if (!user.isBlocked) {
    throw createError('User is not blocked', 400);
  }

  user.isBlocked = false;
  user.blockedAt = undefined;
  user.blockedBy = undefined;
  user.blockReason = undefined;
  await user.save();

  const updatedUser = await User.findById(id)
    .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
    .populate('blockedBy', 'name email');

  res.json({
    message: 'User unblocked successfully',
    user: updatedUser
  });
}));

// Delete user
router.delete('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.user?.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid user ID', 400);
  }

  // Prevent admin from deleting themselves
  if (id === adminId) {
    throw createError('Cannot delete yourself', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw createError('User not found', 404);
  }

  await User.findByIdAndDelete(id);

  res.json({
    message: 'User deleted successfully'
  });
}));

export default router;
