import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  head?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
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
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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
departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });
departmentSchema.index({ isActive: 1 });

export default mongoose.model<IDepartment>('Department', departmentSchema);
