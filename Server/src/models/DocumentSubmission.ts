import mongoose, { Document, Schema } from 'mongoose';

// Individual document item interface
export interface IDocumentItem {
  id: string;
  name: string;
  category: 'theory' | 'lab';
  fileTypes: string[];
  status: 'yes' | 'no' | 'pending';
  uploadedFiles?: Record<string, {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    googleDriveId?: string;
    url?: string;
  }>;
  submittedAt?: Date;
}

// Main document submission interface
export interface IDocumentSubmission extends Document {
  userId: mongoose.Types.ObjectId;
  courseInfo: {
    semester: string;
    courseCode: string;
    courseTitle: string;
    creditHours: string;
    courseSection: string;
    classCount: string;
    batch: string;
    department: string;
  };
  teacherInfo: {
    teacherName: string;
    employeeId: string;
    designation: string;
    emailId: string;
    mobileNumber: string;
  };
  documents: {
    theory: IDocumentItem[];
    lab: IDocumentItem[];
  };
  submissionStatus: 'draft' | 'partial' | 'complete' | 'submitted';
  overallStatus: 'pending' | 'approved' | 'rejected' | 'in-review';
  completionPercentage: number;
  submittedAt?: Date;
  lastModifiedAt: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewComments?: string;
  googleDriveFolders?: {
    theoryFolderId?: string;
    labFolderId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Document item schema
const documentItemSchema = new Schema<IDocumentItem>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['theory', 'lab']
  },
  fileTypes: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    required: true,
    enum: ['yes', 'no', 'pending'],
    default: 'pending'
  },
  uploadedFiles: {
    type: Map,
    of: new Schema({
      name: { type: String, required: true },
      size: { type: Number, required: true },
      type: { type: String, required: true },
      lastModified: { type: Number, required: true },
      googleDriveId: { type: String },
      url: { type: String }
    }, { _id: false })
  },
  submittedAt: {
    type: Date
  }
}, { _id: false });

// Main document submission schema
const documentSubmissionSchema = new Schema<IDocumentSubmission>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseInfo: {
    semester: { type: String, required: true },
    courseCode: { type: String, required: true },
    courseTitle: { type: String, required: true },
    creditHours: { type: String, required: true },
    courseSection: { type: String, required: true },
    classCount: { type: String, required: true },
    batch: { type: String, required: true },
    department: { type: String, required: true }
  },
  teacherInfo: {
    teacherName: { type: String, required: true },
    employeeId: { type: String, required: true },
    designation: { type: String, required: true },
    emailId: { type: String, required: true },
    mobileNumber: { type: String, required: true }
  },
  documents: {
    theory: [documentItemSchema],
    lab: [documentItemSchema]
  },
  submissionStatus: {
    type: String,
    enum: ['draft', 'partial', 'complete', 'submitted'],
    default: 'draft'
  },
  overallStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-review'],
    default: 'pending'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  submittedAt: {
    type: Date
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewComments: {
    type: String
  },
  googleDriveFolders: {
    theoryFolderId: String,
    labFolderId: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
documentSubmissionSchema.index({ userId: 1, 'courseInfo.courseCode': 1, 'courseInfo.courseSection': 1 });
documentSubmissionSchema.index({ submissionStatus: 1 });
documentSubmissionSchema.index({ overallStatus: 1 });
documentSubmissionSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate completion percentage
documentSubmissionSchema.pre('save', function() {
  const allDocuments = [...this.documents.theory, ...this.documents.lab];
  const completedDocuments = allDocuments.filter(doc => doc.status === 'yes');
  const totalDocuments = allDocuments.length;
  
  this.completionPercentage = totalDocuments > 0 ? Math.round((completedDocuments.length / totalDocuments) * 100) : 0;
  
  // Update submission status based on completion
  if (this.completionPercentage === 100) {
    this.submissionStatus = 'complete';
  } else if (this.completionPercentage > 0) {
    this.submissionStatus = 'partial';
  } else {
    this.submissionStatus = 'draft';
  }
  
  this.lastModifiedAt = new Date();
});

// Virtual for getting readable submission status
documentSubmissionSchema.virtual('readableSubmissionStatus').get(function() {
  const statusMap = {
    'draft': 'Draft',
    'partial': 'Partially Complete',
    'complete': 'Complete',
    'submitted': 'Submitted'
  };
  return statusMap[this.submissionStatus] || this.submissionStatus;
});

// Virtual for getting readable overall status
documentSubmissionSchema.virtual('readableOverallStatus').get(function() {
  const statusMap = {
    'pending': 'Pending Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'in-review': 'Under Review'
  };
  return statusMap[this.overallStatus] || this.overallStatus;
});

// Method to get document statistics
documentSubmissionSchema.methods.getDocumentStats = function() {
  const theoryStats = {
    total: this.documents.theory.length,
    completed: this.documents.theory.filter((doc: IDocumentItem) => doc.status === 'yes').length,
    pending: this.documents.theory.filter((doc: IDocumentItem) => doc.status === 'pending').length
  };
  
  const labStats = {
    total: this.documents.lab.length,
    completed: this.documents.lab.filter((doc: IDocumentItem) => doc.status === 'yes').length,
    pending: this.documents.lab.filter((doc: IDocumentItem) => doc.status === 'pending').length
  };
  
  return {
    theory: theoryStats,
    lab: labStats,
    overall: {
      total: theoryStats.total + labStats.total,
      completed: theoryStats.completed + labStats.completed,
      pending: theoryStats.pending + labStats.pending
    }
  };
};

export const DocumentSubmission = mongoose.model<IDocumentSubmission>('DocumentSubmission', documentSubmissionSchema);
