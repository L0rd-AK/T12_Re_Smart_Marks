import { Request, Response } from 'express';
import { DocumentSubmission, IDocumentSubmission, IDocumentItem } from '../models/DocumentSubmission';
import { asyncHandler, createError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

export class DocumentController {
  // Get all document submissions for the current user
  static getDocumentSubmissions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id;
    
    const submissions = await DocumentSubmission.find({ userId })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: submissions
    });
  });

  // Get a specific document submission
  static getDocumentSubmission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid submission ID', 400);
    }

    const submission = await DocumentSubmission.findOne({ 
      _id: id, 
      userId 
    }).populate('reviewedBy', 'name email');

    if (!submission) {
      throw createError('Document submission not found', 404);
    }

    res.json({
      success: true,
      data: submission
    });
  });

  // Create or update document submission
  static saveDocumentSubmission = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id;
    const {
      courseInfo,
      teacherInfo,
      documents,
      googleDriveFolders,
      submissionId
    } = req.body;

    let submission: IDocumentSubmission;

    if (submissionId && mongoose.Types.ObjectId.isValid(submissionId)) {
      // Update existing submission
      submission = await DocumentSubmission.findOneAndUpdate(
        { _id: submissionId, userId },
        {
          courseInfo,
          teacherInfo,
          documents,
          googleDriveFolders,
          lastModifiedAt: new Date()
        },
        { new: true, runValidators: true }
      ) as IDocumentSubmission;

      if (!submission) {
        throw createError('Document submission not found', 404);
      }
    } else {
      // Create new submission
      submission = new DocumentSubmission({
        userId,
        courseInfo,
        teacherInfo,
        documents,
        googleDriveFolders
      });
      await submission.save();
    }

    res.json({
      success: true,
      message: submissionId ? 'Document submission updated successfully' : 'Document submission created successfully',
      data: submission
    });
  });

  // Update document status (individual document within a submission)
  static updateDocumentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    const { documentId, status, category, uploadedFiles } = req.body;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      throw createError('Invalid submission ID', 400);
    }

    const submission = await DocumentSubmission.findOne({
      _id: submissionId,
      userId
    });

    if (!submission) {
      throw createError('Document submission not found', 404);
    }

    // Find and update the specific document
    const documentsArray = category === 'theory' ? submission.documents.theory : submission.documents.lab;
    const documentIndex = documentsArray.findIndex((doc: IDocumentItem) => doc.id === documentId);

    if (documentIndex === -1) {
      throw createError('Document not found', 404);
    }

    // Update document status and files
    documentsArray[documentIndex].status = status;
    if (uploadedFiles) {
      documentsArray[documentIndex].uploadedFiles = uploadedFiles;
    }
    if (status === 'yes') {
      documentsArray[documentIndex].submittedAt = new Date();
    }

    await submission.save();

    res.json({
      success: true,
      message: 'Document status updated successfully',
      data: submission
    });
  });

  // Submit final submission (mark as submitted)
  static submitDocumentSubmission = asyncHandler(async (req: Request, res: Response) => {
    const { submissionId } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(submissionId)) {
      throw createError('Invalid submission ID', 400);
    }

    const submission = await DocumentSubmission.findOne({
      _id: submissionId,
      userId
    });

    if (!submission) {
      throw createError('Document submission not found', 404);
    }

    // Check if submission is complete
    if (submission.completionPercentage < 100) {
      throw createError('Cannot submit incomplete submission. Please complete all required documents.', 400);
    }

    submission.submissionStatus = 'submitted';
    submission.submittedAt = new Date();
    submission.overallStatus = 'pending';

    await submission.save();

    res.json({
      success: true,
      message: 'Document submission submitted successfully',
      data: submission
    });
  });

  // Get current draft or create new submission for a course
  static getCurrentOrCreateSubmission = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id;
    const { 
      courseCode, 
      courseSection, 
      semester,
      courseTitle,
      creditHours,
      classCount,
      batch,
      department
    } = req.query;

    if (!courseCode || !courseSection || !semester) {
      throw createError('Course code, section, and semester are required', 400);
    }

    // Try to find existing draft or partial submission for this course
    let submission = await DocumentSubmission.findOne({
      userId,
      'courseInfo.courseCode': courseCode,
      'courseInfo.courseSection': courseSection,
      'courseInfo.semester': semester,
      submissionStatus: { $in: ['draft', 'partial'] }
    });

    if (!submission) {
      // Create a new draft submission with default documents
      const defaultTheoryDocuments: IDocumentItem[] = [
        {
          id: 'course-outline',
          name: 'Course Outline (.doc Format)',
          category: 'theory',
          fileTypes: ['doc'],
          status: 'pending'
        },
        {
          id: 'class-test',
          name: 'Class Test (Marginal, Average, Excellent Script) with Question',
          category: 'theory',
          fileTypes: ['marginal', 'average', 'excellent', 'question'],
          status: 'pending'
        },
        {
          id: 'attendance',
          name: 'Attendance (Class, Midterm Exam, Final Exam) pdf File',
          category: 'theory',
          fileTypes: ['class-attendance', 'midterm-attendance', 'final-attendance'],
          status: 'pending'
        },
        {
          id: 'assignment',
          name: 'Assignment (Marginal, Average, Excellent Script)',
          category: 'theory',
          fileTypes: ['marginal', 'average', 'excellent'],
          status: 'pending'
        },
        {
          id: 'assignment-marks',
          name: 'Assignment & Presentation Marks Sheet on Rubrics (pdf)',
          category: 'theory',
          fileTypes: ['assignment-marks', 'presentation-marks'],
          status: 'pending'
        },
        {
          id: 'midterm-script',
          name: 'Midterm Exam Script (Marginal, Average, Excellent Script)',
          category: 'theory',
          fileTypes: ['marginal', 'average', 'excellent'],
          status: 'pending'
        },
        {
          id: 'final-script',
          name: 'Final Exam (Marginal, Average, Excellent Script)',
          category: 'theory',
          fileTypes: ['marginal', 'average', 'excellent'],
          status: 'pending'
        },
        {
          id: 'final-tabulation',
          name: 'Final Tabulation Sheet (pdf Format)',
          category: 'theory',
          fileTypes: ['tabulation'],
          status: 'pending'
        },
        {
          id: 'section-wise-co',
          name: 'Section Wise CO – PO Mapping File',
          category: 'theory',
          fileTypes: ['co-po-mapping'],
          status: 'pending'
        },
        {
          id: 'course-end-report',
          name: 'Course End Report duly signed by Section Teacher (pdf Format)',
          category: 'theory',
          fileTypes: ['course-end-report'],
          status: 'pending'
        }
      ];

      const defaultLabDocuments: IDocumentItem[] = [
        {
          id: 'lab-report',
          name: 'Lab Report',
          category: 'lab',
          fileTypes: ['lab-report'],
          status: 'pending'
        },
        {
          id: 'lab-performance',
          name: 'Lab Performance, Lab Final, Project (pdf)',
          category: 'lab',
          fileTypes: ['lab-performance', 'lab-final', 'project'],
          status: 'pending'
        },
        {
          id: 'lab-project',
          name: 'Lab with Project (Marginal, Average, Excellent Report)',
          category: 'lab',
          fileTypes: ['marginal', 'average', 'excellent'],
          status: 'pending'
        },
        {
          id: 'projects-experiments',
          name: 'List of Projects and Experiments & signature (pdf)',
          category: 'lab',
          fileTypes: ['projects-list', 'experiments-list'],
          status: 'pending'
        },
        {
          id: 'class-attendance',
          name: 'Class Attendance pdf File',
          category: 'lab',
          fileTypes: ['attendance'],
          status: 'pending'
        },
        {
          id: 'section-wise-co-lab',
          name: 'Section Wise CO – PO Mapping File',
          category: 'lab',
          fileTypes: ['co-po-mapping'],
          status: 'pending'
        },
        {
          id: 'final-tabulation-lab',
          name: 'Final Tabulation Sheet (pdf Format)',
          category: 'lab',
          fileTypes: ['tabulation'],
          status: 'pending'
        },
        {
          id: 'course-end-report-lab',
          name: 'Course End Report duly signed by Section Teacher (pdf Format)',
          category: 'lab',
          fileTypes: ['course-end-report'],
          status: 'pending'
        }
      ];

      submission = new DocumentSubmission({
        userId,
        courseInfo: {
          semester: semester as string,
          courseCode: courseCode as string,
          courseTitle: (courseTitle as string) || 'Course Title Not Provided',
          creditHours: (creditHours as string) || '3',
          courseSection: courseSection as string,
          classCount: (classCount as string) || '0',
          batch: (batch as string) || 'Not Specified',
          department: (department as string) || 'Not Specified'
        },
        teacherInfo: {
          teacherName: req.user!.name || '',
          employeeId: req.user!.employeeId || '',
          designation: req.user!.designation || '',
          emailId: req.user!.email,
          mobileNumber: req.user!.mobileNumber || ''
        },
        documents: {
          theory: defaultTheoryDocuments,
          lab: defaultLabDocuments
        }
      });

      await submission.save();
    }

    res.json({
      success: true,
      data: submission
    });
  });

  // Delete document submission
  static deleteDocumentSubmission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid submission ID', 400);
    }

    const submission = await DocumentSubmission.findOneAndDelete({
      _id: id,
      userId,
      submissionStatus: { $ne: 'submitted' } // Prevent deletion of submitted submissions
    });

    if (!submission) {
      throw createError('Document submission not found or cannot be deleted', 404);
    }

    res.json({
      success: true,
      message: 'Document submission deleted successfully'
    });
  });

  // Admin/Module Leader functions

  // Get all submissions for review (Admin/Module Leader)
  static getAllSubmissionsForReview = asyncHandler(async (req: Request, res: Response) => {
    const { status, courseCode, department, page = 1, limit = 10 } = req.query;
    
    const filter: any = { submissionStatus: 'submitted' };
    
    if (status && status !== 'all') {
      filter.overallStatus = status;
    }
    if (courseCode) {
      filter['courseInfo.courseCode'] = courseCode;
    }
    if (department) {
      filter['courseInfo.department'] = department;
    }

    const submissions = await DocumentSubmission.find(filter)
      .populate('userId', 'name email employeeId')
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await DocumentSubmission.countDocuments(filter);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  });

  // Update submission review status (Admin/Module Leader)
  static updateSubmissionReviewStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { overallStatus, reviewComments } = req.body;
    const reviewerId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid submission ID', 400);
    }

    const submission = await DocumentSubmission.findByIdAndUpdate(
      id,
      {
        overallStatus,
        reviewComments,
        reviewedBy: reviewerId,
        reviewedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('reviewedBy', 'name email');

    if (!submission) {
      throw createError('Document submission not found', 404);
    }

    res.json({
      success: true,
      message: 'Submission review status updated successfully',
      data: submission
    });
  });
}
