import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignedModuleLeader extends Document {
  course: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  academicYear: number;
  semester: 'Spring' | 'Summer' | 'Fall';
  assignedAt: Date;
  assignedBy: mongoose.Types.ObjectId;
  isActive: boolean;
  remarks?: string;
  assignedTeachers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const assignedModuleLeaderSchema = new Schema<IAssignedModuleLeader>({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: false,
    default: null
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: Number,
    required: true
  },
  semester: {
    type: String,
    enum: ['Spring', 'Summer', 'Fall'],
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  remarks: {
    type: String,
    trim: true
  },
  assignedTeachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
}, {
  timestamps: true
});

// Compound index to ensure one active assignment per course-batch combination
assignedModuleLeaderSchema.index(
  { course: 1, batch: 1, isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

// Index for efficient queries
assignedModuleLeaderSchema.index({ teacher: 1, isActive: 1 });
assignedModuleLeaderSchema.index({ department: 1, academicYear: 1, semester: 1 });
assignedModuleLeaderSchema.index({ assignedAt: -1 });
assignedModuleLeaderSchema.index({ assignedTeachers: 1 });

export default mongoose.model<IAssignedModuleLeader>('ModuleLeader', assignedModuleLeaderSchema);
