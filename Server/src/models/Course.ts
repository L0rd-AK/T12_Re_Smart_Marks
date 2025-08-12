import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  description?: string;
  creditHours: number;
  department: mongoose.Types.ObjectId;
  prerequisites?: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  creditHours: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
courseSchema.index({ name: 1 });
courseSchema.index({ code: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ isActive: 1 });

export default mongoose.model<ICourse>('Course', courseSchema);
