import mongoose, { Document, Schema } from 'mongoose';

// Department interface and schema
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
    required: [true, 'Department name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Department name must be at least 2 characters'],
    maxlength: [100, 'Department name must be less than 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    trim: true,
    unique: true,
    uppercase: true,
    minlength: [2, 'Department code must be at least 2 characters'],
    maxlength: [10, 'Department code must be less than 10 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  head: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Course interface and schema
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
    required: [true, 'Course name is required'],
    trim: true,
    minlength: [2, 'Course name must be at least 2 characters'],
    maxlength: [200, 'Course name must be less than 200 characters']
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    uppercase: true,
    minlength: [3, 'Course code must be at least 3 characters'],
    maxlength: [20, 'Course code must be less than 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description must be less than 1000 characters']
  },
  creditHours: {
    type: Number,
    required: [true, 'Credit hours is required'],
    min: [1, 'Credit hours must be at least 1'],
    max: [10, 'Credit hours cannot exceed 10']
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  prerequisites: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Batch interface and schema
export interface IBatch extends Document {
  name: string;
  year: number;
  semester: 'Spring' | 'Summer' | 'Fall';
  startDate: Date;
  endDate: Date;
  department: mongoose.Types.ObjectId;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const batchSchema = new Schema<IBatch>({
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true,
    minlength: [2, 'Batch name must be at least 2 characters'],
    maxlength: [50, 'Batch name must be less than 50 characters']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be at least 2000'],
    max: [2100, 'Year cannot exceed 2100']
  },
  semester: {
    type: String,
    enum: ['Spring', 'Summer', 'Fall'],
    required: [true, 'Semester is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: IBatch, endDate: Date) {
        return endDate > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Section interface and schema
export interface ISection extends Document {
  name: string;
  batch: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  instructor?: mongoose.Types.ObjectId;
  moduleLeader?: mongoose.Types.ObjectId;
  maxStudents: number;
  currentStudents: number;
  schedule?: {
    day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true,
    minlength: [1, 'Section name must be at least 1 character'],
    maxlength: [10, 'Section name must be less than 10 characters']
  },
  batch: {
    type: Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch is required']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  moduleLeader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  maxStudents: {
    type: Number,
    required: [true, 'Maximum students is required'],
    min: [1, 'Maximum students must be at least 1'],
    max: [200, 'Maximum students cannot exceed 200']
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: [0, 'Current students cannot be negative']
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    },
    room: {
      type: String,
      trim: true,
      maxlength: [50, 'Room name must be less than 50 characters']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Add compound indexes for better performance and uniqueness
departmentSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ code: 1, department: 1 }, { unique: true });
batchSchema.index({ name: 1, department: 1 }, { unique: true });
sectionSchema.index({ name: 1, batch: 1, course: 1 }, { unique: true });

// Pre-save validation for section
sectionSchema.pre('save', function(next) {
  if (this.currentStudents > this.maxStudents) {
    next(new Error('Current students cannot exceed maximum students'));
  } else {
    next();
  }
});

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
export const Course = mongoose.model<ICourse>('Course', courseSchema);
export const Batch = mongoose.model<IBatch>('Batch', batchSchema);
export const Section = mongoose.model<ISection>('Section', sectionSchema);
