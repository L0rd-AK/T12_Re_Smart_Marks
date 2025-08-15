import mongoose, { Document, Schema } from 'mongoose';

export interface ISection extends Document {
  name: string;
  batch: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  instructor?: mongoose.Types.ObjectId;
  moduleLeader?: mongoose.Types.ObjectId;
  maxStudents: number;
  currentStudents: number;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  room: {
    type: String,
    trim: true
  }
});

const sectionSchema = new Schema<ISection>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moduleLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  maxStudents: {
    type: Number,
    required: true,
    min: 1,
    max: 200
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  schedule: [scheduleSchema],
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
sectionSchema.index({ name: 1 });
sectionSchema.index({ batch: 1 });
sectionSchema.index({ course: 1 });
sectionSchema.index({ instructor: 1 });
sectionSchema.index({ moduleLeader: 1 });
sectionSchema.index({ isActive: 1 });

// Compound unique index
sectionSchema.index({ name: 1, batch: 1, course: 1 }, { unique: true });

export default mongoose.model<ISection>('Section', sectionSchema);
