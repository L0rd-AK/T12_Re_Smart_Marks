import { Request, Response } from 'express';
import Notification, { INotification } from '../models/Notification';
import User from '../models/User';
import { io } from '../socket';

export interface CreateNotificationData {
  recipientId: string;
  senderId?: string;
  type: 'course_request' | 'document_submission' | 'course_approved' | 'course_rejected' | 'document_approved' | 'document_rejected';
  title: string;
  message: string;
  data: {
    requestId?: string;
    submissionId?: string;
    courseCode?: string;
    courseTitle?: string;
    teacherName?: string;
    department?: string;
    semester?: string;
    batch?: string;
  };
}

export class NotificationController {
  // Create a new notification and send it via Socket.IO
  static async createAndSendNotification(notificationData: CreateNotificationData): Promise<INotification> {
    try {
      // Create notification in database
      const notification = new Notification(notificationData);
      await notification.save();

      // Send real-time notification via Socket.IO
      io.to(notificationData.recipientId).emit('new_notification', {
        notification: notification.toObject(),
        timestamp: new Date(),
      });

      return notification;
    } catch (error) {
      console.error('Error creating and sending notification:', error);
      throw error;
    }
  }

  // Get notifications for a user
  static async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: any = { recipientId: userId };
      if (unreadOnly === 'true') {
        filter.isRead = false;
      }

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      const total = await Notification.countDocuments(filter);
      const unreadCount = await Notification.countDocuments({ 
        recipientId: userId, 
        isRead: false 
      });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
          unreadCount,
        },
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch notifications' 
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      res.json({
        success: true,
        data: notification,
        message: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to mark notification as read' 
      });
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to mark notifications as read' 
      });
    }
  }

  // Delete a notification
  static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipientId: userId,
      });

      if (!notification) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete notification' 
      });
    }
  }

  // Get unread count for a user
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const unreadCount = await Notification.countDocuments({
        recipientId: userId,
        isRead: false,
      });

      res.json({
        success: true,
        data: { unreadCount },
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch unread count' 
      });
    }
  }
}

export default NotificationController; 