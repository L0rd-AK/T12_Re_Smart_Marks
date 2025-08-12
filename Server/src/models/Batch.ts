import mongoose, { Document, Schema } from 'mongoose';

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
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2030
  },
  semester: {
    type: String,
    required: true,
    enum: ['Spring', 'Summer', 'Fall']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
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
batchSchema.index({ name: 1 });
batchSchema.index({ year: 1, semester: 1 });
batchSchema.index({ department: 1 });
batchSchema.index({ isActive: 1 });

// Compound unique index
batchSchema.index({ name: 1, year: 1, semester: 1, department: 1 }, { unique: true });

export default mongoose.model<IBatch>('Batch', batchSchema);
