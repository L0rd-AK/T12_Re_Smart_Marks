import express from 'express';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/permissions';
import NotificationController, { CreateNotificationData } from '../controllers/notificationController';
import User from '../models/User';
import { CourseRequest } from '../models/CourseRequest';
import { DocumentSubmission } from '../models/DocumentSubmission';

const router = express.Router();

// Apply authentication and role middleware
router.use(authenticate);
router.use(checkRole(['module-leader', 'admin']));

// Get course requests for module leader
router.get('/course-requests', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get user's assigned sections
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // For now, we'll get all course requests
    // In a real implementation, you'd filter by the module leader's assigned sections
    const courseRequests = await CourseRequest.find({ 
      status: { $in: ['pending', 'approved', 'rejected'] }
    }).populate('teacherId', 'name email employeeId');

    res.json({
      success: true,
      data: courseRequests.map((request: any) => ({
        _id: request._id,
        teacherId: request.teacherId._id,
        teacherName: request.teacherId.name,
        teacherEmail: request.teacherId.email,
        employeeId: request.teacherId.employeeId,
        courseId: request._id,
        courseCode: request.courseCode,
        courseTitle: request.courseTitle,
        semester: request.semester,
        batch: request.batch,
        department: request.department,
        reason: request.reason || 'Course assignment request',
        status: request.status,
        requestedAt: request.createdAt,
        reviewedBy: request.reviewedBy,
        reviewedAt: request.reviewedAt,
        reviewComments: request.reviewComments,
      })),
    });
  } catch (error) {
    console.error('Error fetching course requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch course requests' 
    });
  }
});

// Update course request status
router.patch('/course-requests/:requestId/status', async (req: any, res: any) => {
  try {
    const { requestId } = req.params;
    const { status, reviewComments } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Update the course request
    const updatedRequest = await CourseRequest.findByIdAndUpdate(
      requestId,
      {
        status,
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewComments,
      },
      { new: true }
    ).populate('teacherId', 'name email');

    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: 'Course request not found' });
    }

    // Create notification for the teacher
    const notificationData: CreateNotificationData = {
      recipientId: updatedRequest.teacherId._id.toString(),
      senderId: userId,
      type: status === 'approved' ? 'course_approved' : 'course_rejected',
      title: `Course Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your course request for ${updatedRequest.courseCode} - ${updatedRequest.courseTitle} has been ${status}.`,
      data: {
        requestId: requestId,
        courseCode: updatedRequest.courseCode,
        courseTitle: updatedRequest.courseTitle,
        department: updatedRequest.department,
        semester: updatedRequest.semester,
        batch: updatedRequest.batch,
      },
    };

    await NotificationController.createAndSendNotification(notificationData);

    res.json({
      success: true,
      message: `Course request ${status} successfully`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating course request status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update course request status' 
    });
  }
});

// Get document submissions for module leader
router.get('/document-submissions', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get document submissions
    const documentSubmissions = await DocumentSubmission.find()
      .populate('userId', 'name email employeeId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: documentSubmissions.map((submission: any) => ({
        _id: submission._id,
        submissionId: submission._id,
        teacherId: submission.userId._id,
        teacherName: submission.userId.name,
        teacherEmail: submission.userId.email,
        employeeId: submission.userId.employeeId,
        courseCode: submission.courseInfo.courseCode,
        courseTitle: submission.courseInfo.courseTitle,
        semester: submission.courseInfo.semester,
        batch: submission.courseInfo.batch,
        department: submission.courseInfo.department,
        submissionStatus: submission.submissionStatus,
        overallStatus: submission.overallStatus,
        completionPercentage: submission.completionPercentage,
        submittedAt: submission.submittedAt,
        lastModifiedAt: submission.updatedAt,
        reviewComments: submission.reviewComments,
        reviewedBy: submission.reviewedBy,
        reviewedAt: submission.reviewedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching document submissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch document submissions' 
    });
  }
});

// Update document submission status
router.patch('/document-submissions/:submissionId/status', async (req: any, res: any) => {
  try {
    const { submissionId } = req.params;
    const { status, reviewComments } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Update the document submission
    const updatedSubmission = await DocumentSubmission.findByIdAndUpdate(
      submissionId,
      {
        overallStatus: status,
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewComments,
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!updatedSubmission) {
      return res.status(404).json({ success: false, message: 'Document submission not found' });
    }

    // Create notification for the teacher
    const notificationData: CreateNotificationData = {
      recipientId: updatedSubmission.userId._id.toString(),
      senderId: userId,
      type: status === 'approved' ? 'document_approved' : 'document_rejected',
      title: `Document Submission ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your document submission for ${updatedSubmission.courseInfo.courseCode} - ${updatedSubmission.courseInfo.courseTitle} has been ${status}.`,
      data: {
        submissionId: submissionId,
        courseCode: updatedSubmission.courseInfo.courseCode,
        courseTitle: updatedSubmission.courseInfo.courseTitle,
        department: updatedSubmission.courseInfo.department,
        semester: updatedSubmission.courseInfo.semester,
        batch: updatedSubmission.courseInfo.batch,
      },
    };

    await NotificationController.createAndSendNotification(notificationData);

    res.json({
      success: true,
      message: `Document submission ${status} successfully`,
      data: updatedSubmission,
    });
  } catch (error) {
    console.error('Error updating document submission status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update document submission status' 
    });
  }
});

export default router; 