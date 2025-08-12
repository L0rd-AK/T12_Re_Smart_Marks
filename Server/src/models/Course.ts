import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  code: string;
  description: string;
  creditHours: number;
  department: mongoose.Types.ObjectId;
  prerequisites: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  moduleLeader: mongoose.Types.ObjectId;
  year?: string;
  semester?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [100, 'Course name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Course code cannot exceed 20 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      maxlength: [500, 'Course description cannot exceed 500 characters'],
    },
    creditHours: {
      type: Number,
      required: [true, 'Credit hours are required'],
      min: [1, 'Credit hours must be at least 1'],
      max: [6, 'Credit hours cannot exceed 6'],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    prerequisites: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
      default: [],
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
    moduleLeader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Module leader is required'],
    },
    year: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Optional field
          return /^\d{4}$/.test(v);
        },
        message: 'Year must be a 4-digit number',
      },
    },
    semester: {
      type: String,
      enum: {
        values: ['spring', 'summer', 'fall'],
        message: 'Semester must be spring, summer, or fall',
      },
      lowercase: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
courseSchema.index({ code: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ moduleLeader: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.index({ year: 1, semester: 1 });
courseSchema.index({ name: 'text', code: 'text', description: 'text' });

// Virtual for full course name
courseSchema.virtual('fullName').get(function() {
  return `${this.code} - ${this.name}`;
});

// Pre-save middleware to ensure code is uppercase
courseSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase();
  }
  next();
});

// Static method to find courses by department
courseSchema.statics.findByDepartment = function(departmentId: string) {
  return this.find({ department: departmentId, isActive: true })
    .populate('department', 'name code')
    .populate('moduleLeader', 'name email')
    .populate('prerequisites', 'name code')
    .populate('createdBy', 'name email');
};

// Static method to find courses by module leader
courseSchema.statics.findByModuleLeader = function(moduleLeaderId: string) {
  return this.find({ moduleLeader: moduleLeaderId, isActive: true })
    .populate('department', 'name code')
    .populate('moduleLeader', 'name email')
    .populate('prerequisites', 'name code')
    .populate('createdBy', 'name email');
};

// Static method to find courses by year and semester
courseSchema.statics.findByYearSemester = function(year: string, semester: string) {
  return this.find({ year, semester, isActive: true })
    .populate('department', 'name code')
    .populate('moduleLeader', 'name email')
    .populate('prerequisites', 'name code')
    .populate('createdBy', 'name email');
};

// Static method to search courses
courseSchema.statics.search = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true,
  })
    .populate('department', 'name code')
    .populate('moduleLeader', 'name email')
    .populate('prerequisites', 'name code')
    .populate('createdBy', 'name email')
    .sort({ score: { $meta: 'textScore' } });
};

// Instance method to add prerequisites
courseSchema.methods.addPrerequisites = function(prerequisiteIds: string[]) {
  this.prerequisites.push(...prerequisiteIds);
  return this.save();
};

// Instance method to remove prerequisites
courseSchema.methods.removePrerequisites = function(prerequisiteIds: string[]) {
  this.prerequisites = this.prerequisites.filter(
    (prereq: mongoose.Types.ObjectId) => !prerequisiteIds.includes(prereq.toString())
  );
  return this.save();
};

// Instance method to toggle active status
courseSchema.methods.toggleStatus = function() {
  this.isActive = !this.isActive;
  return this.save();
};

export const Course = mongoose.model<ICourse>('Course', courseSchema);
