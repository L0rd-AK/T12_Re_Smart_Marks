import { Request, Response } from 'express';
import { CourseAccessRequest } from '../models/CourseAccessRequest';
import Course from '../models/Course';
import Section from '../models/Section';
import User from '../models/User';
import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import CourseAccess from '../models/CourseAccess';
import AssignedModuleLeader from '../models/AssignedModuleLeader';
import DocumentDistribution from '../models/DocumentDistribution';

// Validation rules
export const createRequestValidation = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('data.semester')
    .notEmpty()
    .withMessage('Semester is required')
    .isString()
    .withMessage('Semester must be a string'),
  body('data.batch')
    .notEmpty()
    .withMessage('Batch is required')
    .isInt({ min: 1 })
    .withMessage('Batch must be a positive integer'),
  body('data.message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('data.moduleLeaderId')
    .notEmpty()
    .withMessage('Module Leader ID is required')
    .isMongoId()
    .withMessage('Invalid Module Leader ID'),
  body('data.section')
    .notEmpty()
    .withMessage('Section is required')
    .isString()
    .withMessage('Section must be a string')

];

export const respondToRequestValidation = [
  param('requestId')
    .isMongoId()
    .withMessage('Invalid request ID'),
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('responseMessage')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Response message must be less than 1000 characters'),
  body('selectedDocuments')
    .optional()
    .isArray()
    .withMessage('Selected documents must be an array')
];

// Create access request
export const createAccessRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { courseId, data } = req.body;
    const teacherId = (req as any).user?._id;

    // Check if course exists
    const course = await Course.findById(courseId).populate('department').populate('moduleLeader');
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Check if there's already a pending request
    const existingRequest = await CourseAccessRequest.findOne({
      course: courseId,
      batch: data.batch,
      semester: data.semester,
      section: data.section,
      teacher: teacherId,
      status: 'pending'
    });

    if (existingRequest) {
      res.status(400).json({
        success: false,
        message: 'You already have a pending request for this course'
      });
      return;
    }

    // Create the access request
    const accessRequest = new CourseAccessRequest({
      course: courseId,
      teacher: teacherId,
      semester: data.semester,
      batch: data.batch,
      section: data.section,
      moduleLeader: course?.moduleLeader?._id,
      message: data.message,
    });

    await accessRequest.save();

    res.status(201).json({
      success: true,
      message: 'Access request created successfully',
      data: accessRequest
    });

  } catch (error) {
    console.error('Error creating access request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's access requests (teacher's view)
export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherId = (req as any).user?._id;

    const requests = await CourseAccessRequest.find({ teacher: teacherId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get pending requests for module leader
export const getPendingRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const moduleLeaderId = (req as any).user?._id;

    const requests = await CourseAccessRequest.find({
      moduleLeader: moduleLeaderId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all requests for module leader (pending, approved, rejected)
export const getAllRequestsForModuleLeader = async (req: Request, res: Response): Promise<void> => {
  try {
    const moduleLeaderId = (req as any).user?._id;

    const requests = await CourseAccessRequest.find({
      moduleLeader: moduleLeaderId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Respond to access request (approve/reject)
export const respondToRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { requestId } = req.params;
    const { status, responseMessage, selectedDocuments } = req.body;
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
    if (request.moduleLeader._id.toString() !== moduleLeaderId.toString()) {
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
    request.responseMessage = responseMessage;
    request.respondedBy = moduleLeaderId;

    await request.save();

    // If approved, add teacher to course section
    // if (status === 'approved') {


    //   const isSameExist = await CourseAccess.findOne({
    //     course: request.course,
    //     teachers: request.teacher,
    //     semester: request.semester,
    //     year: new Date().getFullYear(),
    //     batch: request.batch
    //   });


    //   if (isSameExist) {
    //     await CourseAccess.updateOne(
    //       { course: request.course, semester: request.semester, year: new Date().getFullYear() },
    //       { $addToSet: { teachers: request.teacher } }
    //     );
    //   } else {
    //     const courseAccess = new CourseAccess({
    //       semester: request.semester,
    //       year: new Date().getFullYear(),
    //       course: request.course,
    //       teachers: [request.teacher],
    //       batch: request.batch,
    //       moduleLeader: request.moduleLeader
    //     });
    //     await courseAccess.save();
    //   }
    // }
    if (status === 'approved') {
      const existingAccess = await CourseAccess.findOne({
        course: request.course,
        semester: request.semester,
        year: new Date().getFullYear(),
        batch: request.batch
      });

      if (!existingAccess) {
        // Create new course access
        const courseAccess = new CourseAccess({
          semester: request.semester,
          year: new Date().getFullYear(),
          course: request.course,
          teachers: [request.teacher],
          batch: request.batch,
          moduleLeader: request.moduleLeader,
          sections: [request.section]
        });
        await courseAccess.save();
      } else {
        // Update existing: add teacher and section if not already present
        await CourseAccess.updateOne(
          { _id: existingAccess._id },
          {
            $addToSet: {
              teachers: request.teacher,
              sections: request.section
            }
          }
        );
      }

      // Add teacher to assignedTeachers in AssignedModuleLeader
      const currentYear = new Date().getFullYear();
      const assignedModuleLeader = await AssignedModuleLeader.findOne({
        course: request.course,
        academicYear: currentYear,
        semester: request.semester,
        isActive: true
      });

      if (assignedModuleLeader) {
        // Add teacher to assignedTeachers if not already present
        if (!assignedModuleLeader.assignedTeachers.includes(request.teacher)) {
          assignedModuleLeader.assignedTeachers.push(request.teacher);
          await assignedModuleLeader.save();
        }
      }

      // Share selected documents with the teacher
      if (selectedDocuments && selectedDocuments.length > 0) {
        for (const distributionId of selectedDocuments) {
          const documentDistribution = await DocumentDistribution.findOne({ distributionId });
          if (documentDistribution && documentDistribution.moduleLeader.userId.toString() === moduleLeaderId.toString()) {
            // Add teacher to specific teachers list if not already present
            if (!documentDistribution.permissions.teachers.specificTeachers) {
              documentDistribution.permissions.teachers.specificTeachers = [];
            }
            
            if (!documentDistribution.permissions.teachers.specificTeachers.includes(request.teacher)) {
              documentDistribution.permissions.teachers.specificTeachers.push(request.teacher);
              
              // Add audit trail entry
              documentDistribution.addAuditEntry(
                'permission-changed',
                moduleLeaderId,
                (req as any).user.name,
                `Teacher ${request.teacher} added to specific teachers list`
              );
              
              await documentDistribution.save();
            }
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: request
    });

  } catch (error) {
    console.error('Error responding to request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get courses that user has access to
export const getAccessibleCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    // const userRole = (req as any).user?.role;


    // Teachers can see only they instruct
    const courses = await CourseAccess.find({
      teachers: userId, status: 'ongoing',
    })
      .populate({
        path: 'course',
        populate:[
          { path: 'moduleLeader' },
          { path: 'department' }
        ]
      })
      .lean()
      .then(courseAccesses => courseAccesses.map(access => ({ ...access.course, status: access.status, semester: access.semester, year: access.year, batch: access.batch,sections: access.sections })));

    res.status(200).json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('Error fetching accessible courses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all courses in user's department
export const getDepartmentCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    
    // For now, return all active courses since users don't have department field
    // In the future, this can be enhanced to filter by department
    const allCourses = await Course.find({ isActive: true })
      .populate('department', 'name code')
      .populate('moduleLeader', 'name email initial');

    // Get sections for each course to determine access
    const coursesWithAccess = await Promise.all(
      allCourses.map(async (course) => {
        const sections = await Section.find({ course: course._id })
          .populate('instructor', 'name email')
          .populate('moduleLeader', 'name email')
          .populate('batch', 'semester year');

        const hasAccess = sections.some(section => 
          (section.instructor as any)?._id.toString() === userId.toString() ||
          (section.moduleLeader as any)?._id.toString() === userId.toString()
        );

        return {
          ...course.toObject(),
          sections,
          hasAccess
        };
      })
    );

    res.status(200).json({
      success: true,
      data: coursesWithAccess
    });

  } catch (error) {
    console.error('Error fetching department courses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
