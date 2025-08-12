import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toggleStatus(): Promise<IDepartment>;
}

export interface IDepartmentModel extends Model<IDepartment> {
  findActive(): Promise<IDepartment[]>;
  search(searchTerm: string): Promise<IDepartment[]>;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      trim: true,
      uppercase: true,
      maxlength: [10, 'Department code cannot exceed 10 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Department description cannot exceed 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ name: 'text', code: 'text', description: 'text' });

// Virtual for full department name
departmentSchema.virtual('fullName').get(function() {
  return `${this.code} - ${this.name}`;
});

// Pre-save middleware to ensure code is uppercase
departmentSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase();
  }
  next();
});

// Static method to find active departments
departmentSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to search departments
departmentSchema.statics.search = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true,
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance method to toggle active status
departmentSchema.methods.toggleStatus = function() {
  this.isActive = !this.isActive;
  return this.save();
};

export const Department = mongoose.model<IDepartment, IDepartmentModel>('Department', departmentSchema);
