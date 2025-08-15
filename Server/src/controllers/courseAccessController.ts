import { Request, Response } from 'express';
import { CourseAccessRequest } from '../models/CourseAccessRequest';
import Course from '../models/Course';
import Section from '../models/Section';
import User from '../models/User';
import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Validation rules
export const createRequestValidation = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isMongoId()
    .withMessage('Invalid course ID'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
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
    .withMessage('Response message must be less than 1000 characters')
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

    const { courseId, message } = req.body;
    const teacherId = (req as any).user?._id;

    // Check if course exists
    const course = await Course.findById(courseId).populate('department');
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Find module leader for this course (look for sections with this course)
    const section = await Section.findOne({ 
      course: courseId, 
      moduleLeader: { $exists: true, $ne: null } 
    }).populate('moduleLeader');

    if (!section || !section.moduleLeader) {
      res.status(400).json({
        success: false,
        message: 'No module leader assigned to this course'
      });
      return;
    }

    // Check if teacher already has access to this course
    const existingSection = await Section.findOne({
      course: courseId,
      instructor: teacherId
    });

    if (existingSection) {
      res.status(400).json({
        success: false,
        message: 'You already have access to this course'
      });
      return;
    }

    // Check if there's already a pending request
    const existingRequest = await CourseAccessRequest.findOne({
      course: courseId,
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
      moduleLeader: section.moduleLeader._id,
      message
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
    const { status, responseMessage } = req.body;
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
    request.responseMessage = responseMessage;
    request.respondedBy = moduleLeaderId;

    await request.save();

    // If approved, add teacher to course section
    if (status === 'approved') {
      // Find a section for this course that the module leader manages
      const section = await Section.findOne({
        course: request.course,
        moduleLeader: moduleLeaderId
      });

      if (section && !section.instructor) {
        // Assign teacher as instructor if no instructor is assigned
        section.instructor = request.teacher;
        await section.save();
      } else {
        // Create a new section for this teacher if needed
        const course = await Course.findById(request.course);
        const newSection = new Section({
          name: `Section-${Date.now()}`, // Generate unique section name
          batch: section?.batch, // Use existing batch or you might need to handle this differently
          course: request.course,
          instructor: request.teacher,
          moduleLeader: moduleLeaderId,
          maxStudents: 50, // Default value
          createdBy: moduleLeaderId
        });
        
        await newSection.save();
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
    const userRole = (req as any).user?.role;

    let sections;

    if (userRole === 'module-leader') {
      // Module leaders can see all sections they manage
      sections = await Section.find({ moduleLeader: userId })
        .populate({
          path: 'course',
          populate: { path: 'department', select: 'name code' }
        })
        .populate('batch')
        .populate('instructor', 'name email employeeId');
    } else {
      // Teachers can see sections they instruct
      sections = await Section.find({ instructor: userId })
        .populate({
          path: 'course',
          populate: { path: 'department', select: 'name code' }
        })
        .populate('batch')
        .populate('moduleLeader', 'name email employeeId');
    }

    // Format the response to match the frontend expectations
    const courses = sections.map(section => ({
      id: (section.course as any)._id,
      code: (section.course as any).code,
      title: (section.course as any).name,
      department: (section.course as any).department?.name || 'Unknown',
      semester: `${(section.batch as any)?.semester || 'Unknown'} ${(section.batch as any)?.year || ''}`,
      creditHours: (section.course as any).creditHours,
      moduleLeader: (section.moduleLeader as any)?.name || 'Not Assigned',
      moduleLeaderEmail: (section.moduleLeader as any)?.email || '',
      enrolledTeachers: (section.instructor as any) ? [(section.instructor as any).name] : [],
      status: section.isActive ? 'active' : 'inactive',
      documentProgress: Math.floor(Math.random() * 100), // Placeholder - replace with actual progress calculation
      sectionId: section._id,
      sectionName: section.name,
      maxStudents: section.maxStudents,
      currentStudents: section.currentStudents
    }));

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
    
    // Get user's department through sections they're associated with
    const userSections = await Section.find({
      $or: [
        { instructor: userId },
        { moduleLeader: userId }
      ]
    }).populate({
      path: 'course',
      populate: { path: 'department', select: 'name code' }
    });

    if (userSections.length === 0) {
      res.status(200).json({
        success: true,
        data: []
      });
      return;
    }

    // Get department from first section (assuming user belongs to one department)
    const department = (userSections[0].course as any).department;

    // Get all courses in the department
    const courses = await Course.find({ department: department._id })
      .populate('department', 'name code');

    // Get sections for each course to determine access
    const coursesWithAccess = await Promise.all(
      courses.map(async (course) => {
        const sections = await Section.find({ course: course._id })
          .populate('instructor', 'name email')
          .populate('moduleLeader', 'name email')
          .populate('batch', 'semester year');

        const hasAccess = sections.some(section => 
          (section.instructor as any)?._id.toString() === userId.toString() ||
          (section.moduleLeader as any)?._id.toString() === userId.toString()
        );

        const moduleLeader = sections.find(s => s.moduleLeader)?.moduleLeader;
        const instructors = sections
          .filter(s => s.instructor)
          .map(s => (s.instructor as any)?.name)
          .filter(name => name);

        const batch = sections[0]?.batch;

        return {
          id: course._id,
          code: course.code,
          title: course.name,
          department: (course.department as any).name,
          semester: batch ? `${(batch as any).semester} ${(batch as any).year}` : 'Not Scheduled',
          creditHours: course.creditHours,
          moduleLeader: (moduleLeader as any)?.name || 'Not Assigned',
          moduleLeaderEmail: (moduleLeader as any)?.email || '',
          enrolledTeachers: instructors,
          status: course.isActive ? 'active' : 'inactive',
          documentProgress: Math.floor(Math.random() * 100), // Placeholder
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
