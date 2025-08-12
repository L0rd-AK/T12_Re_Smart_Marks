import express from 'express';
import { authenticate } from '../middleware/auth';
import NotificationController from '../controllers/notificationController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get user notifications with pagination
router.get('/', NotificationController.getUserNotifications);

// Get unread notification count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark specific notification as read
router.patch('/:notificationId/read', NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', NotificationController.markAllAsRead);

// Delete a notification
router.delete('/:notificationId', NotificationController.deleteNotification);

export default router; 