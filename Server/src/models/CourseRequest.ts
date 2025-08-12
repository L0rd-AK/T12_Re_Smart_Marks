import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseRequest extends Document {
  teacherId: mongoose.Types.ObjectId;
  courseCode: string;
  courseTitle: string;
  semester: string;
  batch: string;
  department: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseRequestSchema = new Schema<ICourseRequest>({
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    trim: true
  },
  courseTitle: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewComments: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

// Indexes for better performance
courseRequestSchema.index({ teacherId: 1, status: 1 });
courseRequestSchema.index({ status: 1, createdAt: -1 });
courseRequestSchema.index({ department: 1, status: 1 });

export const CourseRequest = mongoose.model<ICourseRequest>('CourseRequest', courseRequestSchema); 