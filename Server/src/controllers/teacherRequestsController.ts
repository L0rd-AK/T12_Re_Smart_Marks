import { Request, Response } from 'express';
import { CourseAccessRequest } from '../models/CourseAccessRequest';
import { DocumentSubmission } from '../models/DocumentSubmission';
import Course from '../models/Course';
import Section from '../models/Section';
import Batch from '../models/Batch';
import User from '../models/User';
import mongoose from 'mongoose';

// Get all course requests for module leader
export const getCourseRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const moduleLeaderId = (req as any).user?._id;

    // Get all course access requests for this module leader
    const requests = await CourseAccessRequest.find({ 
      moduleLeader: moduleLeaderId 
    })
    .populate({
      path: 'course',
      populate: { path: 'department', select: 'name code' }
    })
    .populate('teacher', 'name email employeeId designation')
    .populate('moduleLeader', 'name email employeeId')
    .populate('respondedBy', 'name email')
    .sort({ createdAt: -1 });

    // Transform the data to match frontend expectations
    const transformedRequests = await Promise.all(
      requests.map(async (request) => {
        // Find the section and batch for this course
        const section = await Section.findOne({ 
          course: request.course._id,
          moduleLeader: moduleLeaderId 
        }).populate('batch');

        return {
          _id: request._id,
          teacherId: (request.teacher as any)._id,
          teacherName: (request.teacher as any).name,
          teacherEmail: (request.teacher as any).email,
          employeeId: (request.teacher as any).employeeId || '',
          courseId: (request.course as any)._id,
          courseCode: (request.course as any).code,
          courseTitle: (request.course as any).name,
          semester: section?.batch ? `${(section.batch as any).semester} ${(section.batch as any).year}` : 'Not Scheduled',
          batch: section?.batch ? `${(section.batch as any).semester} ${(section.batch as any).year}` : 'Not Scheduled',
          department: (request.course as any).department?.name || 'Unknown',
          reason: request.message,
          status: request.status,
          requestedAt: request.createdAt,
          reviewedBy: (request.respondedBy as any)?.name,
          reviewedAt: request.responseDate,
          reviewComments: request.responseMessage
        };
      })
    );

    res.status(200).json({
      success: true,
      data: transformedRequests
    });

  } catch (error) {
    console.error('Error fetching course requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update course request status
export const updateCourseRequestStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { status, reviewComments } = req.body;
    const moduleLeaderId = (req as any).user?._id;

    // Find the request
    const request = await CourseAccessRequest.findById(requestId);
    if (!request) {
      res.status(404).json({
        success: false,
        message: 'Request not found'
      });
      return;
    }

    // Verify the current user is the module leader for this request
    if (request.moduleLeader.toString() !== moduleLeaderId.toString()) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this request'
      });
      return;
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'This request has already been responded to'
      });
      return;
    }

    // Update the request
    request.status = status;
    request.responseDate = new Date();
    request.responseMessage = reviewComments;
    request.respondedBy = moduleLeaderId;

    await request.save();

    // If approved, add teacher to course section
    if (status === 'approved') {
      // Find a section for this course that the module leader manages
      let section = await Section.findOne({
        course: request.course,
        moduleLeader: moduleLeaderId
      });

      if (section && !section.instructor) {
        // Assign teacher as instructor if no instructor is assigned
        section.instructor = request.teacher;
        await section.save();
      } else if (!section) {
        // Create a new section for this teacher if needed
        const course = await Course.findById(request.course);
        if (course) {
          // Find any batch for this course or create a default one
          let batch = await Batch.findOne({ course: request.course });
          
          const newSection = new Section({
            name: `Section-${Date.now()}`, // Generate unique section name
            batch: batch?._id,
            course: request.course,
            instructor: request.teacher,
            moduleLeader: moduleLeaderId,
            maxStudents: 50, // Default value
            createdBy: moduleLeaderId
          });
          
          await newSection.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: request
    });

  } catch (error) {
    console.error('Error updating course request status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all document submission requests for module leader
export const getDocumentSubmissionRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const moduleLeaderId = (req as any).user?._id;

    // Get all document submissions for courses managed by this module leader
    const sections = await Section.find({ 
      moduleLeader: moduleLeaderId 
    }).populate('course');

    const courseCodes = sections.map(section => (section.course as any).code);

    // Get document submissions for these courses using course codes
    const submissions = await DocumentSubmission.find({
      'courseInfo.courseCode': { $in: courseCodes }
    })
    .populate('userId', 'name email employeeId designation')
    .sort({ updatedAt: -1 });

    // Transform the data to match frontend expectations
    const transformedSubmissions = submissions.map(submission => {
      return {
        _id: submission._id,
        submissionId: submission._id,
        teacherId: submission.userId._id,
        teacherName: submission.teacherInfo.teacherName,
        teacherEmail: submission.teacherInfo.emailId,
        employeeId: submission.teacherInfo.employeeId,
        courseCode: submission.courseInfo.courseCode,
        courseTitle: submission.courseInfo.courseTitle,
        semester: submission.courseInfo.semester,
        batch: submission.courseInfo.batch,
        department: submission.courseInfo.department,
        submissionStatus: submission.submissionStatus,
        overallStatus: submission.overallStatus,
        completionPercentage: submission.completionPercentage,
        submittedAt: submission.submittedAt,
        lastModifiedAt: submission.lastModifiedAt,
        reviewComments: submission.reviewComments,
        reviewedBy: submission.reviewedBy,
        reviewedAt: submission.reviewedAt
      };
    });

    res.status(200).json({
      success: true,
      data: transformedSubmissions
    });

  } catch (error) {
    console.error('Error fetching document submission requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update document submission status
export const updateDocumentSubmissionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { status, reviewComments } = req.body;
    const moduleLeaderId = (req as any).user?._id;

    // Find the submission
    const submission = await DocumentSubmission.findById(submissionId);
    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Document submission not found'
      });
      return;
    }

    // Verify the current user is the module leader for this course
    const section = await Section.findOne({
      'course.code': submission.courseInfo.courseCode,
      moduleLeader: moduleLeaderId
    });

    if (!section) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to review this submission'
      });
      return;
    }

    // Update the submission
    submission.overallStatus = status;
    submission.reviewedAt = new Date();
    submission.reviewComments = reviewComments;
    submission.reviewedBy = moduleLeaderId;

    await submission.save();

    res.status(200).json({
      success: true,
      message: `Document submission ${status} successfully`,
      data: submission
    });

  } catch (error) {
    console.error('Error updating document submission status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
