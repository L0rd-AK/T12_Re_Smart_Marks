import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
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
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipientId: {
    type: String,
    required: true,
    index: true,
  },
  senderId: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
    enum: ['course_request', 'document_submission', 'course_approved', 'course_rejected', 'document_approved', 'document_rejected'],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    requestId: String,
    submissionId: String,
    courseCode: String,
    courseTitle: String,
    teacherName: String,
    department: String,
    semester: String,
    batch: String,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema); 