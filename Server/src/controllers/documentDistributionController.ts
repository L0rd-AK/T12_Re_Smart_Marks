import { Request, Response } from 'express';
import DocumentDistribution, { IDocumentDistribution } from '../models/DocumentDistribution';
import User from '../models/User';
import Course from '../models/Course';
import { GoogleDriveService } from '../services/googleDriveService';

// Constants
const PARENT_FOLDER_ID = '1D-y0Ck0_0ArHmxv4xPwWTIjrhVWT1INR';

// Create new document distribution
export const createDocumentDistribution = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      tags,
      priority,
      courseId,
      academicYear,
      semester,
      batch,
      section,
      classCount,
      permissions,
      files
    } = req.body;

    const userId = (req as any).user.id;

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get course information
    const course = await Course.findById(courseId).populate('department');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Generate distribution ID
    const distributionId = DocumentDistribution.generateDistributionId();

    // Create folder structure in Google Drive
    const folderStructure = {
      year: academicYear,
      semester,
      batch,
      courseCode: course.code,
      courseName: course.name,
      department: (course.department as any).name,
      subFolder: category
    };

    // Create Google Drive folder (optional - handle failures gracefully)
    let googleDriveFolderId = null;
    let googleDriveFolderPath = null;
    
    try {
      googleDriveFolderId = await GoogleDriveService.createFolder(
        `${academicYear}/${semester}/${batch}/${course.code}/${category}`,
        PARENT_FOLDER_ID
      );
      googleDriveFolderPath = `${academicYear}/${semester}/${batch}/${course.code}/${category}`;
      console.log('✅ Google Drive folder created successfully');
    } catch (driveError) {
      console.warn('⚠️ Google Drive folder creation failed, continuing without Drive integration:', driveError.message);
      // Continue without Google Drive integration
    }

    // Create document distribution record
    const documentDistribution = new DocumentDistribution({
      distributionId,
      title,
      description,
      category,
      tags: tags || [],
      priority: priority || 'medium',
      files: [],
      totalFileSize: 0,
      fileCount: 0,
      googleDriveFolderId,
      googleDriveFolderPath,
      folderStructure,
      course: {
        courseId: course._id,
        courseCode: course.code,
        courseName: course.name,
        creditHours: course.creditHours,
        department: course.department,
        departmentName: (course.department as any).name
      },
      academicInfo: {
        academicYear,
        semester,
        batch,
        section,
        classCount
      },
      moduleLeader: {
        userId: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId || '',
        department: user.department || ''
      },
      permissions: permissions || {
        teachers: { canView: true, canDownload: true, canComment: true, canEdit: false },
        students: { canView: true, canDownload: true, canComment: false, canEdit: false },
        public: { canView: false, canDownload: false, canComment: false, canEdit: false }
      },
      distributionStatus: {
        status: 'pending'
      },
      accessTracking: {
        totalViews: 0,
        totalDownloads: 0,
        uniqueViewers: [],
        uniqueDownloaders: [],
        accessLog: []
      },
      createdBy: userId,
      lastModifiedBy: userId,
      version: 1,
      auditTrail: [{
        action: 'created',
        timestamp: new Date(),
        userId: user._id,
        userName: user.name,
        details: 'Document distribution created'
      }]
    });

    await documentDistribution.save();

    res.status(201).json({
      success: true,
      message: 'Document distribution created successfully',
      data: documentDistribution
    });
  } catch (error) {
    console.error('Error creating document distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create document distribution',
      error: error.message
    });
  }
};

// Upload files to document distribution
export const uploadFilesToDistribution = async (req: Request, res: Response) => {
  try {
    const { distributionId } = req.params;
    const { files } = req.body;
    const userId = (req as any).user.id;

    const documentDistribution = await DocumentDistribution.findOne({ distributionId });
    if (!documentDistribution) {
      return res.status(404).json({ message: 'Document distribution not found' });
    }

    // Check if user is the module leader
    if (documentDistribution.moduleLeader.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. Only module leader can upload files.' });
    }

    const uploadedFiles = [];
    const previousState = documentDistribution.files;

    for (const file of files) {
      try {
        // Since files are already uploaded to Google Drive by the client,
        // we just need to create the file metadata
        // The client should provide the Google Drive file ID
        const fileMetadata = {
          originalName: file.name,
          fileType: file.name.split('.').pop() || '',
          fileSize: file.size,
          mimeType: file.type,
          googleDriveId: file.googleDriveId || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          liveViewLink: file.googleDriveId ? `https://drive.google.com/file/d/${file.googleDriveId}/view` : '',
          downloadLink: file.googleDriveId ? `https://drive.google.com/uc?export=download&id=${file.googleDriveId}` : '',
          thumbnailLink: file.googleDriveId ? `https://drive.google.com/thumbnail?id=${file.googleDriveId}` : '',
          uploadedAt: new Date(),
          lastModified: new Date()
        };

        uploadedFiles.push(fileMetadata);
      } catch (uploadError) {
        console.error(`Error processing file ${file.name}:`, uploadError);
        // Continue with other files
      }
    }

    // Add files to document distribution
    documentDistribution.files.push(...uploadedFiles);
    documentDistribution.lastModifiedBy = userId;
    documentDistribution.version += 1;

    // Add audit trail entry
    documentDistribution.addAuditEntry(
      'file-added',
      userId,
      (req as any).user.name,
      `Added ${uploadedFiles.length} file(s) to distribution`,
      previousState
    );

    await documentDistribution.save();

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        uploadedFiles,
        totalFiles: documentDistribution.files.length,
        totalSize: documentDistribution.totalFileSize
      }
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message
    });
  }
};

// Get document distribution by ID
export const getDocumentDistribution = async (req: Request, res: Response) => {
  try {
    const { distributionId } = req.params;
    const userId = (req as any).user.id;

    const documentDistribution = await DocumentDistribution.findOne({ distributionId })
      .populate('course.courseId')
      .populate('course.department')
      .populate('moduleLeader.userId')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!documentDistribution) {
      return res.status(404).json({ message: 'Document distribution not found' });
    }

    // Check access permissions
    const hasAccess = await checkAccessPermissions(documentDistribution, userId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Track access
    documentDistribution.trackAccess(userId, 'view', req.ip, req.get('User-Agent'));
    await documentDistribution.save();

    res.json({
      success: true,
      data: documentDistribution
    });
  } catch (error) {
    console.error('Error getting document distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document distribution',
      error: error.message
    });
  }
};

// Get all document distributions (with filtering)
export const getDocumentDistributions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      page = 1,
      limit = 10,
      category,
      courseCode,
      department,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build filter query
    const filter: any = {};

    if (category) filter.category = category;
    if (courseCode) filter['course.courseCode'] = new RegExp(courseCode as string, 'i');
    if (department) filter['course.departmentName'] = new RegExp(department as string, 'i');
    if (status) filter['distributionStatus.status'] = status;
    if (priority) filter.priority = priority;

    // Role-based filtering
    if (user.role === 'module-leader') {
      filter['moduleLeader.userId'] = userId;
    } else if (user.role === 'teacher') {
      // Teachers can see documents they have access to
      filter['permissions.teachers.canView'] = true;
    } else if (user.role === 'user') {
      // Students can see documents they have access to
      filter['permissions.students.canView'] = true;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
        { tags: { $in: [new RegExp(search as string, 'i')] } },
        { 'course.courseName': new RegExp(search as string, 'i') }
      ];
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const documentDistributions = await DocumentDistribution.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('course.courseId', 'name code')
      .populate('course.department', 'name')
      .populate('moduleLeader.userId', 'name email')
      .select('-files -auditTrail -accessTracking.accessLog');

    const total = await DocumentDistribution.countDocuments(filter);

    res.json({
      success: true,
      data: documentDistributions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error getting document distributions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document distributions',
      error: error.message
    });
  }
};

// Update document distribution
export const updateDocumentDistribution = async (req: Request, res: Response) => {
  try {
    const { distributionId } = req.params;
    const updateData = req.body;
    const userId = (req as any).user.id;

    const documentDistribution = await DocumentDistribution.findOne({ distributionId });
    if (!documentDistribution) {
      return res.status(404).json({ message: 'Document distribution not found' });
    }

    // Check if user is the module leader
    if (documentDistribution.moduleLeader.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. Only module leader can update.' });
    }

    const previousState = { ...documentDistribution.toObject() };

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'files' && key !== 'distributionId' && key !== 'googleDriveFolderId') {
        (documentDistribution as any)[key] = updateData[key];
      }
    });

    documentDistribution.lastModifiedBy = userId;
    documentDistribution.version += 1;

    // Add audit trail entry
    documentDistribution.addAuditEntry(
      'updated',
      userId,
      (req as any).user.name,
      'Document distribution updated',
      previousState
    );

    await documentDistribution.save();

    res.json({
      success: true,
      message: 'Document distribution updated successfully',
      data: documentDistribution
    });
  } catch (error) {
    console.error('Error updating document distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document distribution',
      error: error.message
    });
  }
};

// Update distribution status
export const updateDistributionStatus = async (req: Request, res: Response) => {
  try {
    const { distributionId } = req.params;
    const { status, notes, reason } = req.body;
    const userId = (req as any).user.id;

    const documentDistribution = await DocumentDistribution.findOne({ distributionId });
    if (!documentDistribution) {
      return res.status(404).json({ message: 'Document distribution not found' });
    }

    // Check if user is the module leader
    if (documentDistribution.moduleLeader.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. Only module leader can update status.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    documentDistribution.updateDistributionStatus(status, userId, user.name, notes, reason);
    documentDistribution.lastModifiedBy = userId;
    documentDistribution.version += 1;

    await documentDistribution.save();

    res.json({
      success: true,
      message: 'Distribution status updated successfully',
      data: documentDistribution.distributionStatus
    });
  } catch (error) {
    console.error('Error updating distribution status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update distribution status',
      error: error.message
    });
  }
};

// Delete document distribution
export const deleteDocumentDistribution = async (req: Request, res: Response) => {
  try {
    const { distributionId } = req.params;
    const userId = (req as any).user.id;

    const documentDistribution = await DocumentDistribution.findOne({ distributionId });
    if (!documentDistribution) {
      return res.status(404).json({ message: 'Document distribution not found' });
    }

    // Check if user is the module leader
    if (documentDistribution.moduleLeader.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. Only module leader can delete.' });
    }

    // Archive instead of delete for audit purposes
    documentDistribution.updateDistributionStatus(
      'archived',
      userId,
      (req as any).user.name,
      undefined,
      'Deleted by module leader'
    );

    await documentDistribution.save();

    res.json({
      success: true,
      message: 'Document distribution archived successfully'
    });
  } catch (error) {
    console.error('Error deleting document distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document distribution',
      error: error.message
    });
  }
};

// Get distribution analytics
export const getDistributionAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { distributionId } = req.params;

    const documentDistribution = await DocumentDistribution.findOne({ distributionId });
    if (!documentDistribution) {
      return res.status(404).json({ message: 'Document distribution not found' });
    }

    // Check if user is the module leader
    if (documentDistribution.moduleLeader.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. Only module leader can view analytics.' });
    }

    const analytics = {
      totalViews: documentDistribution.accessTracking.totalViews,
      totalDownloads: documentDistribution.accessTracking.totalDownloads,
      uniqueViewers: documentDistribution.accessTracking.uniqueViewers.length,
      uniqueDownloaders: documentDistribution.accessTracking.uniqueDownloaders.length,
      lastAccessed: documentDistribution.accessTracking.lastAccessedAt,
      fileCount: documentDistribution.fileCount,
      totalSize: documentDistribution.totalFileSize,
      status: documentDistribution.distributionStatus.status,
      createdAt: documentDistribution.createdAt,
      lastModified: documentDistribution.updatedAt
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting distribution analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get distribution analytics',
      error: error.message
    });
  }
};

// Helper function to check access permissions
const checkAccessPermissions = async (documentDistribution: IDocumentDistribution, userId: string): Promise<boolean> => {
  const user = await User.findById(userId);
  if (!user) return false;

  // Module leader always has access
  if (documentDistribution.moduleLeader.userId.toString() === userId) {
    return true;
  }

  // Check teacher permissions
  if (user.role === 'teacher') {
    const teacherPerms = documentDistribution.permissions.teachers;
    if (teacherPerms.canView) {
      // Check if specific teachers are restricted
      if (teacherPerms.specificTeachers && teacherPerms.specificTeachers.length > 0) {
        return teacherPerms.specificTeachers.some(id => id.toString() === userId);
      }
      return true;
    }
  }

  // Check student permissions
  if (user.role === 'user') {
    const studentPerms = documentDistribution.permissions.students;
    if (studentPerms.canView) {
      // Check batch and section restrictions
      if (studentPerms.specificBatches && studentPerms.specificBatches.length > 0) {
        // This would need to be implemented based on your user model structure
        return true; // Simplified for now
      }
      return true;
    }
  }

  // Check public permissions
  if (documentDistribution.permissions.public.canView) {
    return true;
  }

  return false;
};
