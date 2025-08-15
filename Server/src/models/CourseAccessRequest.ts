import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseAccessRequest extends Document {
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  moduleLeader: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  batch: number;
  semester: string;
  section: string;
  message: string;
  requestDate: Date;
  responseDate?: Date;
  responseMessage?: string;
  respondedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseAccessRequestSchema = new Schema<ICourseAccessRequest>({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  moduleLeader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Module leader is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },batch:{
    type: Number,
    required: [true, 'Batch is required']
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['Spring', 'Summer', 'Fall']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    maxlength: [50, 'Section must be less than 50 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [1000, 'Message must be less than 1000 characters']
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  responseDate: {
    type: Date
  },
  responseMessage: {
    type: String,
    trim: true,
    maxlength: [1000, 'Response message must be less than 1000 characters']
  },
  respondedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure a teacher can only have one pending request per course
courseAccessRequestSchema.index(
  { course: 1, teacher: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'pending' }
  }
);

// Populate related fields automatically
courseAccessRequestSchema.pre(/^find/, function(next) {
  (this as any).populate({
    path: 'course',
    select: 'name code creditHours department',
    populate: {
      path: 'department',
      select: 'name code'
    }
  })
  .populate({
    path: 'teacher',
    select: 'name email employeeId designation'
  })
  .populate({
    path: 'moduleLeader',
    select: 'name email employeeId designation'
  })
  .populate({
    path: 'respondedBy',
    select: 'name email'
  });
  
  next();
});

export const CourseAccessRequest = mongoose.model<ICourseAccessRequest>('CourseAccessRequest', courseAccessRequestSchema);
