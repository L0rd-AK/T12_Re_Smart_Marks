import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Department, Course, Batch, Section } from '../models/Academic';
import User from '../models/User';
import { createError, asyncHandler } from '../middleware/errorHandler';
import {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateBatchInput,
  UpdateBatchInput,
  CreateSectionInput,
  UpdateSectionInput,
  AssignModuleLeaderInput
} from '../schemas/admin';

// Department Controllers
export class DepartmentController {
  // Get all departments
  static getDepartments = asyncHandler(async (req: Request, res: Response) => {
    const departments = await Department.find({ isActive: true })
      .populate('head', 'name email')
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    res.json(departments);
  });

  // Get single department
  static getDepartment = asyncHandler(async (req: Request, res: Response) => {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name email')
      .populate('createdBy', 'name');

    if (!department) {
      throw createError('Department not found', 404);
    }

    res.json(department);
  });

  // Create department
  static createDepartment = asyncHandler(async (req: Request<{}, {}, CreateDepartmentInput>, res: Response) => {
    const { name, code, description, head, isActive } = req.body;

    // Check if department with same code already exists
    const existingDepartment = await Department.findOne({ code });
    if (existingDepartment) {
      throw createError('Department with this code already exists', 400);
    }

    // If head is provided, verify the user exists and is active
    if (head) {
      const headUser = await User.findById(head);
      if (!headUser) {
        throw createError('Head user not found', 400);
      }
    }

    const department = new Department({
      name,
      code,
      description,
      head,
      isActive: isActive ?? true,
      createdBy: req.user!._id
    });

    await department.save();
    await department.populate('head', 'name email');

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  });

  // Update department
  static updateDepartment = asyncHandler(async (req: Request<{ id: string }, {}, UpdateDepartmentInput>, res: Response) => {
    const { name, code, description, head, isActive } = req.body;

    // If code is being updated, check for duplicates
    if (code) {
      const existingDepartment = await Department.findOne({
        code,
        _id: { $ne: req.params.id }
      });
      if (existingDepartment) {
        throw createError('Department with this code already exists', 400);
      }
    }

    // If head is provided, verify the user exists
    if (head) {
      const headUser = await User.findById(head);
      if (!headUser) {
        throw createError('Head user not found', 400);
      }
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, code, description, head, isActive },
      { new: true, runValidators: true }
    ).populate('head', 'name email');

    if (!department) {
      throw createError('Department not found', 404);
    }

    res.json({
      message: 'Department updated successfully',
      department
    });
  });

  // Delete department (soft delete)
  static deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!department) {
      throw createError('Department not found', 404);
    }

    res.json({ message: 'Department deleted successfully' });
  });
}

// Course Controllers
export class CourseController {
  // Get all courses
  static getCourses = asyncHandler(async (req: Request, res: Response) => {
    const { department } = req.query;

    const filter: any = { isActive: true };
    if (department) {
      filter.department = department;
    }

    const courses = await Course.find(filter)
      .populate('department', 'name code')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name')
      .sort({ code: 1 });

    res.json(courses);
  });

  // Get single course
  static getCourse = asyncHandler(async (req: Request, res: Response) => {
    const course = await Course.findById(req.params.id)
      .populate('department', 'name code')
      .populate('prerequisites', 'name code')
      .populate('createdBy', 'name');

    if (!course) {
      throw createError('Course not found', 404);
    }

    res.json(course);
  });

  // Create course
  static createCourse = asyncHandler(async (req: Request<{}, {}, CreateCourseInput>, res: Response) => {
    const { name, code, description, creditHours, department, prerequisites, isActive } = req.body;

    // Check if course with same code in same department already exists
    const existingCourse = await Course.findOne({ code, department });
    if (existingCourse) {
      throw createError('Course with this code already exists in the department', 400);
    }

    // Verify department exists
    const departmentDoc = await Department.findById(department);
    if (!departmentDoc) {
      throw createError('Department not found', 400);
    }

    // Verify prerequisites exist if provided
    if (prerequisites && prerequisites.length > 0) {
      const prereqCourses = await Course.find({ _id: { $in: prerequisites } });
      if (prereqCourses.length !== prerequisites.length) {
        throw createError('One or more prerequisite courses not found', 400);
      }
    }

    const course = new Course({
      name,
      code,
      description,
      creditHours,
      department,
      prerequisites,
      isActive: isActive ?? true,
      createdBy: req.user!._id
    });

    await course.save();
    await course.populate([
      { path: 'department', select: 'name code' },
      { path: 'prerequisites', select: 'name code' }
    ]);

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  });

  // Update course
  static updateCourse = asyncHandler(async (req: Request<{ id: string }, {}, UpdateCourseInput>, res: Response) => {
    const { name, code, description, creditHours, department, prerequisites, isActive } = req.body;

    // If code or department is being updated, check for duplicates
    if (code || department) {
      const currentCourse = await Course.findById(req.params.id);
      if (!currentCourse) {
        throw createError('Course not found', 404);
      }

      const checkCode = code || currentCourse.code;
      const checkDepartment = department || currentCourse.department;

      const existingCourse = await Course.findOne({
        code: checkCode,
        department: checkDepartment,
        _id: { $ne: req.params.id }
      });
      if (existingCourse) {
        throw createError('Course with this code already exists in the department', 400);
      }
    }

    // Verify department exists if provided
    if (department) {
      const departmentDoc = await Department.findById(department);
      if (!departmentDoc) {
        throw createError('Department not found', 400);
      }
    }

    // Verify prerequisites exist if provided
    if (prerequisites && prerequisites.length > 0) {
      const prereqCourses = await Course.find({ _id: { $in: prerequisites } });
      if (prereqCourses.length !== prerequisites.length) {
        throw createError('One or more prerequisite courses not found', 400);
      }
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, code, description, creditHours, department, prerequisites, isActive },
      { new: true, runValidators: true }
    ).populate([
      { path: 'department', select: 'name code' },
      { path: 'prerequisites', select: 'name code' }
    ]);

    if (!course) {
      throw createError('Course not found', 404);
    }

    res.json({
      message: 'Course updated successfully',
      course
    });
  });

  // Delete course (soft delete)
  static deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!course) {
      throw createError('Course not found', 404);
    }

    res.json({ message: 'Course deleted successfully' });
  });
}

// Batch Controllers
export class BatchController {
  // Get all batches
  static getBatches = asyncHandler(async (req: Request, res: Response) => {
    const { department } = req.query;

    const filter: any = { isActive: true };
    if (department) {
      filter.department = department;
    }

    const batches = await Batch.find(filter)
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .sort({ year: -1, semester: 1 });

    res.json(batches);
  });

  // Get single batch
  static getBatch = asyncHandler(async (req: Request, res: Response) => {
    const batch = await Batch.findById(req.params.id)
      .populate('department', 'name code')
      .populate('createdBy', 'name');

    if (!batch) {
      throw createError('Batch not found', 404);
    }

    res.json(batch);
  });

  // Create batch
  static createBatch = asyncHandler(async (req: Request<{}, {}, CreateBatchInput>, res: Response) => {
    const { name, year, semester, startDate, endDate, department, isActive } = req.body;

    // Check if batch with same name in same department already exists
    const existingBatch = await Batch.findOne({ name, department });
    if (existingBatch) {
      throw createError('Batch with this name already exists in the department', 400);
    }

    // Verify department exists
    const departmentDoc = await Department.findById(department);
    if (!departmentDoc) {
      throw createError('Department not found', 400);
    }

    const batch = new Batch({
      name,
      year,
      semester,
      startDate,
      endDate,
      department,
      isActive: isActive ?? true,
      createdBy: req.user!._id
    });

    await batch.save();
    await batch.populate('department', 'name code');

    res.status(201).json({
      message: 'Batch created successfully',
      batch
    });
  });

  // Update batch
  static updateBatch = asyncHandler(async (req: Request<{ id: string }, {}, UpdateBatchInput>, res: Response) => {
    const { name, year, semester, startDate, endDate, department, isActive } = req.body;

    // If name or department is being updated, check for duplicates
    if (name || department) {
      const currentBatch = await Batch.findById(req.params.id);
      if (!currentBatch) {
        throw createError('Batch not found', 404);
      }

      const checkName = name || currentBatch.name;
      const checkDepartment = department || currentBatch.department;

      const existingBatch = await Batch.findOne({
        name: checkName,
        department: checkDepartment,
        _id: { $ne: req.params.id }
      });
      if (existingBatch) {
        throw createError('Batch with this name already exists in the department', 400);
      }
    }

    // Verify department exists if provided
    if (department) {
      const departmentDoc = await Department.findById(department);
      if (!departmentDoc) {
        throw createError('Department not found', 400);
      }
    }

    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { name, year, semester, startDate, endDate, department, isActive },
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!batch) {
      throw createError('Batch not found', 404);
    }

    res.json({
      message: 'Batch updated successfully',
      batch
    });
  });

  // Delete batch (soft delete)
  static deleteBatch = asyncHandler(async (req: Request, res: Response) => {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!batch) {
      throw createError('Batch not found', 404);
    }

    res.json({ message: 'Batch deleted successfully' });
  });
}

// Section Controllers
export class SectionController {
  // Get all sections
  static getSections = asyncHandler(async (req: Request, res: Response) => {
    const { batch, course } = req.query;

    const filter: any = { isActive: true };
    if (batch) filter.batch = batch;
    if (course) filter.course = course;

    const sections = await Section.find(filter)
      .populate('batch', 'name year semester')
      .populate('course', 'name code creditHours')
      .populate('instructor', 'name email')
      .populate('moduleLeader', 'name email')
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    res.json(sections);
  });

  // Get single section
  static getSection = asyncHandler(async (req: Request, res: Response) => {
    const section = await Section.findById(req.params.id)
      .populate('batch', 'name year semester')
      .populate('course', 'name code creditHours')
      .populate('instructor', 'name email')
      .populate('moduleLeader', 'name email')
      .populate('createdBy', 'name');

    if (!section) {
      throw createError('Section not found', 404);
    }

    res.json(section);
  });

  // Create section
  static createSection = asyncHandler(async (req: Request<{}, {}, CreateSectionInput>, res: Response) => {
    const { name, batch, course, instructor, moduleLeader, maxStudents, currentStudents, schedule, isActive } = req.body;

    // Check if section with same name for same batch and course already exists
    const existingSection = await Section.findOne({ name, batch, course });
    if (existingSection) {
      throw createError('Section with this name already exists for this batch and course', 400);
    }

    // Verify batch and course exist
    const [batchDoc, courseDoc] = await Promise.all([
      Batch.findById(batch),
      Course.findById(course)
    ]);

    if (!batchDoc) throw createError('Batch not found', 400);
    if (!courseDoc) throw createError('Course not found', 400);

    // Verify instructor and module leader exist if provided
    if (instructor) {
      const instructorUser = await User.findById(instructor);
      if (!instructorUser) throw createError('Instructor not found', 400);
    }

    if (moduleLeader) {
      const moduleLeaderUser = await User.findById(moduleLeader);
      if (!moduleLeaderUser) throw createError('Module leader not found', 400);
    }

    const section = new Section({
      name,
      batch,
      course,
      instructor,
      moduleLeader,
      maxStudents,
      currentStudents: currentStudents || 0,
      schedule,
      isActive: isActive ?? true,
      createdBy: req.user!._id
    });

    await section.save();
    await section.populate([
      { path: 'batch', select: 'name year semester' },
      { path: 'course', select: 'name code creditHours' },
      { path: 'instructor', select: 'name email' },
      { path: 'moduleLeader', select: 'name email' }
    ]);

    res.status(201).json({
      message: 'Section created successfully',
      section
    });
  });

  // Update section
  static updateSection = asyncHandler(async (req: Request<{ id: string }, {}, UpdateSectionInput>, res: Response) => {
    const { name, batch, course, instructor, moduleLeader, maxStudents, currentStudents, schedule, isActive } = req.body;

    // If name, batch, or course is being updated, check for duplicates
    if (name || batch || course) {
      const currentSection = await Section.findById(req.params.id);
      if (!currentSection) {
        throw createError('Section not found', 404);
      }

      const checkName = name || currentSection.name;
      const checkBatch = batch || currentSection.batch;
      const checkCourse = course || currentSection.course;

      const existingSection = await Section.findOne({
        name: checkName,
        batch: checkBatch,
        course: checkCourse,
        _id: { $ne: req.params.id }
      });
      if (existingSection) {
        throw createError('Section with this name already exists for this batch and course', 400);
      }
    }

    // Verify batch and course exist if provided
    if (batch) {
      const batchDoc = await Batch.findById(batch);
      if (!batchDoc) throw createError('Batch not found', 400);
    }

    if (course) {
      const courseDoc = await Course.findById(course);
      if (!courseDoc) throw createError('Course not found', 400);
    }

    // Verify instructor and module leader exist if provided
    if (instructor) {
      const instructorUser = await User.findById(instructor);
      if (!instructorUser) throw createError('Instructor not found', 400);
    }

    if (moduleLeader) {
      const moduleLeaderUser = await User.findById(moduleLeader);
      if (!moduleLeaderUser) throw createError('Module leader not found', 400);
    }

    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { name, batch, course, instructor, moduleLeader, maxStudents, currentStudents, schedule, isActive },
      { new: true, runValidators: true }
    ).populate([
      { path: 'batch', select: 'name year semester' },
      { path: 'course', select: 'name code creditHours' },
      { path: 'instructor', select: 'name email' },
      { path: 'moduleLeader', select: 'name email' }
    ]);

    if (!section) {
      throw createError('Section not found', 404);
    }

    res.json({
      message: 'Section updated successfully',
      section
    });
  });

  // Delete section (soft delete)
  static deleteSection = asyncHandler(async (req: Request, res: Response) => {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!section) {
      throw createError('Section not found', 404);
    }

    res.json({ message: 'Section deleted successfully' });
  });

  // Assign module leader to section
  static assignModuleLeader = asyncHandler(async (req: Request<{}, {}, AssignModuleLeaderInput>, res: Response) => {
    const { sectionId, moduleLeaderId } = req.body;

    // Verify section exists
    const section = await Section.findById(sectionId);
    if (!section) {
      throw createError('Section not found', 400);
    }

    // Verify module leader exists
    const moduleLeader = await User.findById(moduleLeaderId);
    if (!moduleLeader) {
      throw createError('Module leader not found', 400);
    }

    // Update section with module leader
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { moduleLeader: moduleLeaderId },
      { new: true }
    ).populate([
      { path: 'batch', select: 'name year semester' },
      { path: 'course', select: 'name code creditHours' },
      { path: 'instructor', select: 'name email' },
      { path: 'moduleLeader', select: 'name email' }
    ]);

    res.json({
      message: 'Module leader assigned successfully',
      section: updatedSection
    });
  });
}

// Admin Dashboard Stats
export class AdminStatsController {
  static getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const [
      departmentCount,
      courseCount,
      batchCount,
      sectionCount,
      userCount,
      recentDepartments,
      recentCourses,
      recentBatches,
      recentSections
    ] = await Promise.all([
      Department.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      Batch.countDocuments({ isActive: true }),
      Section.countDocuments({ isActive: true }),
      User.countDocuments(),
      Department.find({ isActive: true }).sort({ createdAt: -1 }).limit(5),
      Course.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).populate('department', 'name'),
      Batch.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).populate('department', 'name'),
      Section.find({ isActive: true }).sort({ createdAt: -1 }).limit(5)
        .populate('batch', 'name')
        .populate('course', 'name code')
    ]);

    res.json({
      stats: {
        departments: departmentCount,
        courses: courseCount,
        batches: batchCount,
        sections: sectionCount,
        users: userCount
      },
      recent: {
        departments: recentDepartments,
        courses: recentCourses,
        batches: recentBatches,
        sections: recentSections
      }
    });
  });
}

// User Management
export class UserController {
  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search, role, isBlocked } = req.query as any;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (isBlocked !== undefined) {
      filter.isBlocked = isBlocked === 'true';
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
        .populate('blockedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  static updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Defensive: support both { data: { role } } and { role }
    let role;
    if (req.body && typeof req.body === 'object') {
      if ('data' in req.body && req.body.data && typeof req.body.data === 'object' && 'role' in req.body.data) {
        role = req.body.data.role;
      } else if ('role' in req.body) {
        role = req.body.role;
      }
    }
    const adminId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid user ID', 400);
    }

    // Prevent admin from changing their own role
    if (id === adminId) {
      throw createError('Cannot change your own role', 400);
    }

    // Validate role value
    const validRoles = ['user', 'admin', 'teacher', 'module-leader'];
    if (!role || !validRoles.includes(role)) {
      throw createError('Invalid or missing role', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('User not found', 404);
    }

    user.role = role;
    await user.save();

    const updatedUser = await User.findById(id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
      .populate('blockedBy', 'name email');

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  });

  static blockUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid user ID', 400);
    }

    // Prevent admin from blocking themselves
    if (id === adminId) {
      throw createError('Cannot block yourself', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.isBlocked) {
      throw createError('User is already blocked', 400);
    }

    user.isBlocked = true;
    user.blockedAt = new Date();
    user.blockedBy = new mongoose.Types.ObjectId(adminId);
    user.blockReason = reason;
    await user.save();

    const updatedUser = await User.findById(id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
      .populate('blockedBy', 'name email');

    res.json({
      message: 'User blocked successfully',
      user: updatedUser
    });
  });

  static unblockUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid user ID', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.isBlocked) {
      throw createError('User is not blocked', 400);
    }

    user.isBlocked = false;
    user.blockedAt = undefined;
    user.blockedBy = undefined;
    user.blockReason = undefined;
    await user.save();

    const updatedUser = await User.findById(id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
      .populate('blockedBy', 'name email');

    res.json({
      message: 'User unblocked successfully',
      user: updatedUser
    });
  });

  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError('Invalid user ID', 400);
    }

    // Prevent admin from deleting themselves
    if (id === adminId) {
      throw createError('Cannot delete yourself', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      throw createError('User not found', 404);
    }

    await User.findByIdAndDelete(id);

    res.json({
      message: 'User deleted successfully'
    });
  });

  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const [totalUsers, activeUsers, blockedUsers, adminUsers, teacherUsers, moduleLeaderUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBlocked: false }),
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'module-leader' })
    ]);

    res.json({
      totalUsers,
      activeUsers,
      blockedUsers,
      adminUsers,
      teacherUsers,
      moduleLeaderUsers
    });
  });
}
