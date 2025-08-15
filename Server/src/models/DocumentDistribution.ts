import mongoose, { Document, Schema } from 'mongoose';

// Individual file metadata interface
export interface IFileMetadata {
  originalName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  googleDriveId: string;
  liveViewLink: string;
  downloadLink: string;
  thumbnailLink?: string;
  uploadedAt: Date;
  lastModified: Date;
  checksum?: string;
}

// Permission settings interface
export interface IPermissionSettings {
  teachers: {
    canView: boolean;
    canDownload: boolean;
    canComment: boolean;
    canEdit: boolean;
    specificTeachers?: mongoose.Types.ObjectId[];
  };
  students: {
    canView: boolean;
    canDownload: boolean;
    canComment: boolean;
    canEdit: boolean;
    specificBatches?: string[];
    specificSections?: string[];
  };
  public: {
    canView: boolean;
    canDownload: boolean;
    canComment: boolean;
    canEdit: boolean;
  };
}

// Distribution status tracking
export interface IDistributionStatus {
  status: 'pending' | 'distributed' | 'archived' | 'expired';
  distributedAt?: Date;
  archivedAt?: Date;
  expiresAt?: Date;
  distributionNotes?: string;
  archivedBy?: mongoose.Types.ObjectId;
  archiveReason?: string;
}

// Access tracking interface
export interface IAccessTracking {
  totalViews: number;
  totalDownloads: number;
  uniqueViewers: mongoose.Types.ObjectId[];
  uniqueDownloaders: mongoose.Types.ObjectId[];
  lastAccessedAt?: Date;
  accessLog: Array<{
    userId: mongoose.Types.ObjectId;
    action: 'view' | 'download' | 'comment' | 'edit';
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
  }>;
}

// Main document distribution interface
export interface IDocumentDistribution extends Document {
  // Unique identifier
  distributionId: string;
  
  // Document metadata
  title: string;
  description?: string;
  category: 'lecture-notes' | 'assignments' | 'syllabus' | 'reading-material' | 'exams' | 'templates' | 'other';
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // File information
  files: IFileMetadata[];
  totalFileSize: number;
  fileCount: number;
  
  // Google Drive integration
  googleDriveFolderId?: string;
  googleDriveFolderPath?: string;
  folderStructure: {
    year: string;
    semester: string;
    batch: string;
    courseCode: string;
    courseName: string;
    department: string;
    subFolder?: string;
  };
  
  // Academic context
  course: {
    courseId: mongoose.Types.ObjectId;
    courseCode: string;
    courseName: string;
    creditHours: number;
    department: mongoose.Types.ObjectId;
    departmentName: string;
  };
  
  academicInfo: {
    academicYear: string;
    semester: string;
    batch: string;
    section?: string;
    classCount?: number;
  };
  
  // Module leader information
     moduleLeader: {
     userId: mongoose.Types.ObjectId;
     name: string;
     email: string;
     employeeId?: string;
     department?: string;
   };
  
  // Access control and permissions
  permissions: IPermissionSettings;
  
  // Distribution status and tracking
  distributionStatus: IDistributionStatus;
  
  // Access tracking and analytics
  accessTracking: IAccessTracking;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy: mongoose.Types.ObjectId;
  
  // Version control
  version: number;
  previousVersions?: mongoose.Types.ObjectId[];
  
  // Audit trail
  auditTrail: Array<{
    action: 'created' | 'updated' | 'distributed' | 'archived' | 'permission-changed' | 'file-added' | 'file-removed';
    timestamp: Date;
    userId: mongoose.Types.ObjectId;
    userName: string;
    details: string;
    previousState?: any;
  }>;
}

// File metadata schema
const fileMetadataSchema = new Schema<IFileMetadata>({
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  mimeType: {
    type: String,
    required: true
  },
  googleDriveId: {
    type: String,
    required: true,
    unique: true
  },
  liveViewLink: {
    type: String,
    required: true
  },
  downloadLink: {
    type: String,
    required: true
  },
  thumbnailLink: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  checksum: {
    type: String
  }
}, { _id: false });

// Permission settings schema
const permissionSettingsSchema = new Schema<IPermissionSettings>({
  teachers: {
    canView: { type: Boolean, default: true },
    canDownload: { type: Boolean, default: true },
    canComment: { type: Boolean, default: true },
    canEdit: { type: Boolean, default: false },
    specificTeachers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  students: {
    canView: { type: Boolean, default: true },
    canDownload: { type: Boolean, default: true },
    canComment: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    specificBatches: [String],
    specificSections: [String]
  },
  public: {
    canView: { type: Boolean, default: false },
    canDownload: { type: Boolean, default: false },
    canComment: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false }
  }
}, { _id: false });

// Distribution status schema
const distributionStatusSchema = new Schema<IDistributionStatus>({
  status: {
    type: String,
    enum: ['pending', 'distributed', 'archived', 'expired'],
    default: 'pending'
  },
  distributedAt: Date,
  archivedAt: Date,
  expiresAt: Date,
  distributionNotes: String,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  archiveReason: String
}, { _id: false });

// Access tracking schema
const accessTrackingSchema = new Schema<IAccessTracking>({
  totalViews: {
    type: Number,
    default: 0
  },
  totalDownloads: {
    type: Number,
    default: 0
  },
  uniqueViewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  uniqueDownloaders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastAccessedAt: Date,
  accessLog: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['view', 'download', 'comment', 'edit'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }]
}, { _id: false });

// Main document distribution schema
const documentDistributionSchema = new Schema<IDocumentDistribution>({
  distributionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Document metadata
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['lecture-notes', 'assignments', 'syllabus', 'reading-material', 'exams', 'templates', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // File information
  files: [fileMetadataSchema],
  totalFileSize: {
    type: Number,
    default: 0
  },
  fileCount: {
    type: Number,
    default: 0
  },
  
  // Google Drive integration
  googleDriveFolderId: {
    type: String,
    required: false
  },
  googleDriveFolderPath: {
    type: String,
    required: false
  },
  folderStructure: {
    year: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      required: true
    },
    batch: {
      type: String,
      required: true
    },
    courseCode: {
      type: String,
      required: true
    },
    courseName: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    subFolder: String
  },
  
  // Academic context
  course: {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    courseCode: {
      type: String,
      required: true
    },
    courseName: {
      type: String,
      required: true
    },
    creditHours: {
      type: Number,
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    departmentName: {
      type: String,
      required: true
    }
  },
  
  academicInfo: {
    academicYear: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      required: true
    },
    batch: {
      type: String,
      required: true
    },
    section: String,
    classCount: Number
  },
  
  // Module leader information
  moduleLeader: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
         employeeId: {
       type: String,
       required: false
     },
     department: {
       type: String,
       required: false
     }
  },
  
  // Access control and permissions
  permissions: {
    type: permissionSettingsSchema,
    required: true
  },
  
  // Distribution status and tracking
  distributionStatus: {
    type: distributionStatusSchema,
    required: true
  },
  
  // Access tracking and analytics
  accessTracking: {
    type: accessTrackingSchema,
    required: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentDistribution'
  }],
  
  // Audit trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'distributed', 'archived', 'permission-changed', 'file-added', 'file-removed'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    },
    previousState: Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
// Note: distributionId index is automatically created by unique: true constraint
documentDistributionSchema.index({ 'course.courseCode': 1 });
documentDistributionSchema.index({ 'course.department': 1 });
documentDistributionSchema.index({ 'moduleLeader.userId': 1 });
documentDistributionSchema.index({ 'folderStructure.year': 1, 'folderStructure.semester': 1 });
documentDistributionSchema.index({ 'folderStructure.batch': 1 });
documentDistributionSchema.index({ category: 1 });
documentDistributionSchema.index({ 'distributionStatus.status': 1 });
documentDistributionSchema.index({ createdAt: -1 });
documentDistributionSchema.index({ 'accessTracking.lastAccessedAt': -1 });
documentDistributionSchema.index({ tags: 1 });
documentDistributionSchema.index({ priority: 1 });

// Compound indexes for common queries
documentDistributionSchema.index({ 
  'course.department': 1, 
  'folderStructure.year': 1, 
  'folderStructure.semester': 1 
});

documentDistributionSchema.index({ 
  'moduleLeader.userId': 1, 
  'distributionStatus.status': 1 
});

// Pre-save middleware to update file count and total size
documentDistributionSchema.pre('save', function(next) {
  if (this.files && this.files.length > 0) {
    this.fileCount = this.files.length;
    this.totalFileSize = this.files.reduce((total, file) => total + file.fileSize, 0);
  }
  next();
});

// Method to add audit trail entry
documentDistributionSchema.methods.addAuditEntry = function(
  action: string,
  userId: mongoose.Types.ObjectId,
  userName: string,
  details: string,
  previousState?: any
) {
  this.auditTrail.push({
    action: action as any,
    timestamp: new Date(),
    userId,
    userName,
    details,
    previousState
  });
};

// Method to track access
documentDistributionSchema.methods.trackAccess = function(
  userId: mongoose.Types.ObjectId,
  action: 'view' | 'download' | 'comment' | 'edit',
  ipAddress?: string,
  userAgent?: string
) {
  this.accessTracking.totalViews += action === 'view' ? 1 : 0;
  this.accessTracking.totalDownloads += action === 'download' ? 1 : 0;
  
  if (action === 'view' && !this.accessTracking.uniqueViewers.includes(userId)) {
    this.accessTracking.uniqueViewers.push(userId);
  }
  
  if (action === 'download' && !this.accessTracking.uniqueDownloaders.includes(userId)) {
    this.accessTracking.uniqueDownloaders.push(userId);
  }
  
  this.accessTracking.lastAccessedAt = new Date();
  
  this.accessTracking.accessLog.push({
    userId,
    action,
    timestamp: new Date(),
    ipAddress,
    userAgent
  });
  
  // Keep only last 1000 access log entries to prevent unbounded growth
  if (this.accessTracking.accessLog.length > 1000) {
    this.accessTracking.accessLog = this.accessTracking.accessLog.slice(-1000);
  }
};

// Method to update distribution status
documentDistributionSchema.methods.updateDistributionStatus = function(
  status: 'pending' | 'distributed' | 'archived' | 'expired',
  userId: mongoose.Types.ObjectId,
  userName: string,
  notes?: string,
  reason?: string
) {
  const previousStatus = this.distributionStatus.status;
  this.distributionStatus.status = status;
  
  if (status === 'distributed') {
    this.distributionStatus.distributedAt = new Date();
    this.distributionStatus.distributionNotes = notes;
  } else if (status === 'archived') {
    this.distributionStatus.archivedAt = new Date();
    this.distributionStatus.archivedBy = userId;
    this.distributionStatus.archiveReason = reason;
  }
  
  this.addAuditEntry(
    'permission-changed',
    userId,
    userName,
    `Status changed from ${previousStatus} to ${status}${notes ? `: ${notes}` : ''}`
  );
};

// Static method to generate distribution ID
documentDistributionSchema.statics.generateDistributionId = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `DOC-${timestamp}-${random}`.toUpperCase();
};

export default mongoose.model<IDocumentDistribution>('DocumentDistribution', documentDistributionSchema);
