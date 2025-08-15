import express, { Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import User from '../models/User';
import Department from '../models/Department';
import Course from '../models/Course';
import Batch from '../models/Batch';
import Section from '../models/Section';
import { createError, asyncHandler } from '../middleware/errorHandler';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createCourseSchema,
  updateCourseSchema,
  createBatchSchema,
  updateBatchSchema,
  createSectionSchema,
  updateSectionSchema
} from '../schemas/admin';
import mongoose from 'mongoose';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole(['admin']));

// User Management Routes
// Get all users with filtering and pagination
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
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
}));

// Get user statistics
router.get('/users/stats', asyncHandler(async (req: Request, res: Response) => {
  const [totalUsers, activeUsers, blockedUsers, adminUsers, teacherUsers, moduleLeaderUsers, regularUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isBlocked: false }),
    User.countDocuments({ isBlocked: true }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'module-leader' }),
    User.countDocuments({ role: 'user' })
  ]);

  res.json({
    totalUsers,
    activeUsers,
    blockedUsers,
    adminUsers,
    teacherUsers,
    moduleLeaderUsers,
    regularUsers
  });
}));

// Update user role
router.put('/users/:id/role', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body.data || req.body;
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
}));

// Block user
router.put('/users/:id/block', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body.data || req.body;
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
}));

// Unblock user
router.put('/users/:id/unblock', asyncHandler(async (req: Request, res: Response) => {
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
}));

// Delete user
router.delete('/users/:id', asyncHandler(async (req: Request, res: Response) => {
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
}));

// Dashboard Stats Route
router.get('/dashboard/stats', asyncHandler(async (req: Request, res: Response) => {
  // Get basic stats
  const [departmentCount, courseCount, batchCount, sectionCount, userCount] = await Promise.all([
    Department.countDocuments(),
    Course.countDocuments(),
    Batch.countDocuments(),
    Section.countDocuments(),
    User.countDocuments()
  ]);

  const stats = {
    departments: departmentCount,
    courses: courseCount,
    batches: batchCount,
    sections: sectionCount,
    users: userCount,
  };

  // Get recent data
  const [recentDepartments, recentCourses, recentBatches, recentSections] = await Promise.all([
    Department.find({ isActive: true })
      .populate('head', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
    Course.find({ isActive: true })
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
    Batch.find({ isActive: true })
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
    Section.find({ isActive: true })
      .populate('batch', 'name year semester')
      .populate('course', 'name code creditHours')
      .populate('instructor', 'name email')
      .populate('moduleLeader', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  const recent = {
    departments: recentDepartments,
    courses: recentCourses,
    batches: recentBatches,
    sections: recentSections,
  };

  res.json({
    stats,
    recent
  });
}));

// Department Routes
router.get('/departments', asyncHandler(async (req: Request, res: Response) => {
  const departments = await Department.find()
    .populate('head', 'name email')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.json(departments);
}));

router.get('/departments/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid department ID', 400);
  }

  const department = await Department.findById(id)
    .populate('head', 'name email')
    .populate('createdBy', 'name');

  if (!department) {
    throw createError('Department not found', 404);
  }

  res.json(department);
}));

router.post('/departments', validateRequest(createDepartmentSchema), asyncHandler(async (req: Request, res: Response) => {
  const { name, code, description, head, isActive = true } = req.body;
  const adminId = (req as any).user.id;

  // Validate required fields
  if (!name || !code) {
    throw createError('Name and code are required', 400);
  }

  // Check if department with same name or code already exists
  const existingDepartment = await Department.findOne({
    $or: [{ name }, { code: code.toUpperCase() }]
  });

  if (existingDepartment) {
    throw createError('Department with this name or code already exists', 400);
  }

  // Validate head if provided
  if (head) {
    const headUser = await User.findOne({ _id: head, role: { $in: ['admin', 'teacher'] } });
    if (!headUser) {
      throw createError('Invalid department head', 400);
    }
  }

  const department = new Department({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    description: description?.trim(),
    head,
    isActive,
    createdBy: adminId
  });

  await department.save();
  await department.populate([
    { path: 'head', select: 'name email' },
    { path: 'createdBy', select: 'name' }
  ]);

  res.status(201).json({
    message: 'Department created successfully',
    department
  });
}));

router.put('/departments/:id', validateRequest(updateDepartmentSchema), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code, description, head, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid department ID', 400);
  }

  const department = await Department.findById(id);
  if (!department) {
    throw createError('Department not found', 404);
  }

  // Check for duplicate name or code (excluding current department)
  if (name || code) {
    const query: any = { _id: { $ne: id } };
    if (name && name !== department.name) {
      query.$or = [{ name }];
    }
    if (code && code.toUpperCase() !== department.code) {
      query.$or = query.$or ? [...query.$or, { code: code.toUpperCase() }] : [{ code: code.toUpperCase() }];
    }

    if (query.$or) {
      const existingDepartment = await Department.findOne(query);
      if (existingDepartment) {
        throw createError('Department with this name or code already exists', 400);
      }
    }
  }

  // Validate head if provided
  if (head) {
    const headUser = await User.findOne({ _id: head, role: { $in: ['admin', 'teacher'] } });
    if (!headUser) {
      throw createError('Invalid department head', 400);
    }
  }

  // Update fields
  if (name) department.name = name.trim();
  if (code) department.code = code.trim().toUpperCase();
  if (description !== undefined) department.description = description?.trim();
  if (head !== undefined) department.head = head;
  if (isActive !== undefined) department.isActive = isActive;

  await department.save();
  await department.populate([
    { path: 'head', select: 'name email' },
    { path: 'createdBy', select: 'name' }
  ]);

  res.json({
    message: 'Department updated successfully',
    department
  });
}));

router.delete('/departments/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid department ID', 400);
  }

  const department = await Department.findById(id);
  if (!department) {
    throw createError('Department not found', 404);
  }

  // Check if department has courses
  const courseCount = await Course.countDocuments({ department: id });
  if (courseCount > 0) {
    throw createError('Cannot delete department with existing courses', 400);
  }

  await Department.findByIdAndDelete(id);

  res.json({
    message: 'Department deleted successfully'
  });
}));

// Course Routes
router.get('/courses', asyncHandler(async (req: Request, res: Response) => {
  const { department } = req.query;

  const filter: any = {};
  if (department) {
    filter.department = department;
  }

  const courses = await Course.find(filter)
    .populate('department', 'name code')
    .populate('moduleLeader', 'name email role')
    .populate('prerequisites', 'name code')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.json(courses);
}));

router.get('/courses/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid course ID', 400);
  }

  const course = await Course.findById(id)
    .populate('department', 'name code')
    .populate('moduleLeader', 'name email role')
    .populate('prerequisites', 'name code')
    .populate('createdBy', 'name');

  if (!course) {
    throw createError('Course not found', 404);
  }

  res.json(course);
}));

router.post('/courses', validateRequest(createCourseSchema), asyncHandler(async (req: Request, res: Response) => {
  const { name, code, description, creditHours, department, moduleLeader, prerequisites, isActive = true } = req.body;
  const adminId = (req as any).user.id;

  // Validate required fields
  if (!name || !code || !creditHours || !department) {
    throw createError('Name, code, credit hours, and department are required', 400);
  }

  // Validate credit hours
  if (creditHours < 1 || creditHours > 10) {
    throw createError('Credit hours must be between 1 and 10', 400);
  }

  // Check if course with same code already exists
  const existingCourse = await Course.findOne({ code: code.toUpperCase() });
  if (existingCourse) {
    throw createError('Course with this code already exists', 400);
  }

  // Validate department
  const dept = await Department.findById(department);
  if (!dept) {
    throw createError('Invalid department', 400);
  }

  // Validate module leader if provided
  if (moduleLeader) {
    const moduleLeaderUser = await User.findOne({
      _id: moduleLeader,
      role: { $in: ['teacher', 'module_leader'] },
      isBlocked: false
    });
    if (!moduleLeaderUser) {
      throw createError('Module leader must be a teacher and not blocked', 400);
    }
  }

  // Validate prerequisites if provided
  if (prerequisites && prerequisites.length > 0) {
    const prereqCourses = await Course.find({ _id: { $in: prerequisites } });
    if (prereqCourses.length !== prerequisites.length) {
      throw createError('Invalid prerequisites', 400);
    }
  }

  const course = new Course({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    description: description?.trim(),
    creditHours,
    department,
    moduleLeader,
    prerequisites: prerequisites || [],
    isActive,
    createdBy: adminId
  });

  await course.save();
  await course.populate([
    { path: 'department', select: 'name code' },
    { path: 'moduleLeader', select: 'name email role' },
    { path: 'prerequisites', select: 'name code' },
    { path: 'createdBy', select: 'name' }
  ]);

  res.status(201).json({
    message: 'Course created successfully',
    course
  });
}));

router.put('/courses/:id', validateRequest(updateCourseSchema), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code, description, creditHours, department, moduleLeader, prerequisites, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid course ID', 400);
  }

  const course = await Course.findById(id);
  if (!course) {
    throw createError('Course not found', 404);
  }

  // Check for duplicate code (excluding current course)
  if (code && code.toUpperCase() !== course.code) {
    const existingCourse = await Course.findOne({
      code: code.toUpperCase(),
      _id: { $ne: id }
    });
    if (existingCourse) {
      throw createError('Course with this code already exists', 400);
    }
  }

  // Validate credit hours
  if (creditHours && (creditHours < 1 || creditHours > 10)) {
    throw createError('Credit hours must be between 1 and 10', 400);
  }

  // Validate department if provided
  if (department) {
    const dept = await Department.findById(department);
    if (!dept) {
      throw createError('Invalid department', 400);
    }
  }

  // Validate module leader if provided
  if (moduleLeader) {
    const moduleLeaderUser = await User.findOne({
      _id: moduleLeader,
      role: { $in: ['teacher', 'module_leader'] },
      isBlocked: false
    });
    if (!moduleLeaderUser) {
      throw createError('Module leader must be a teacher and not blocked', 400);
    }
  }

  // Validate prerequisites if provided
  if (prerequisites) {
    if (prerequisites.length > 0) {
      const prereqCourses = await Course.find({ _id: { $in: prerequisites } });
      if (prereqCourses.length !== prerequisites.length) {
        throw createError('Invalid prerequisites', 400);
      }
    }
  }

  // Update fields
  if (name) course.name = name.trim();
  if (code) course.code = code.trim().toUpperCase();
  if (description !== undefined) course.description = description?.trim();
  if (creditHours) course.creditHours = creditHours;
  if (department) course.department = department;
  if (moduleLeader !== undefined) course.moduleLeader = moduleLeader;
  if (prerequisites !== undefined) course.prerequisites = prerequisites;
  if (isActive !== undefined) course.isActive = isActive;

  await course.save();
  await course.populate([
    { path: 'department', select: 'name code' },
    { path: 'moduleLeader', select: 'name email role' },
    { path: 'prerequisites', select: 'name code' },
    { path: 'createdBy', select: 'name' }
  ]);

  res.json({
    message: 'Course updated successfully',
    course
  });
}));

router.delete('/courses/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid course ID', 400);
  }

  const course = await Course.findById(id);
  if (!course) {
    throw createError('Course not found', 404);
  }

  // Check if course has sections
  const sectionCount = await Section.countDocuments({ course: id });
  if (sectionCount > 0) {
    throw createError('Cannot delete course with existing sections', 400);
  }

  // Check if course is a prerequisite for other courses
  const dependentCourses = await Course.countDocuments({ prerequisites: id });
  if (dependentCourses > 0) {
    throw createError('Cannot delete course that is a prerequisite for other courses', 400);
  }

  await Course.findByIdAndDelete(id);

  res.json({
    message: 'Course deleted successfully'
  });
}));

// Assign Module Leader to Course
router.post('/courses/:id/assign-module-leader', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { moduleLeaderId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid course ID', 400);
  }

  const course = await Course.findById(id);
  if (!course) {
    throw createError('Course not found', 404);
  }

  // Validate module leader
  if (moduleLeaderId) {
    const moduleLeaderUser = await User.findOne({
      _id: moduleLeaderId,
      role: { $in: ['teacher', 'module_leader'] },
      isBlocked: false
    });
    if (!moduleLeaderUser) {
      throw createError('Module leader must be a teacher and not blocked', 400);
    }
  }

  course.moduleLeader = moduleLeaderId;
  await course.save();
  await course.populate([
    { path: 'department', select: 'name code' },
    { path: 'moduleLeader', select: 'name email role' },
    { path: 'prerequisites', select: 'name code' },
    { path: 'createdBy', select: 'name' }
  ]);

  res.json({
    message: moduleLeaderId ? 'Module leader assigned successfully' : 'Module leader removed successfully',
    course
  });
}));

// Get available teachers for module leader assignment
router.get('/courses/available-module-leaders', asyncHandler(async (req: Request, res: Response) => {
  const { search, limit = 50 } = req.query as any;

  const filter: any = {
    role: { $in: ['teacher', 'module_leader'] },
    isBlocked: false,
    isEmailVerified: true
  };

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const teachers = await User.find(filter)
    .select('name email role')
    .sort({ firstName: 1, lastName: 1 })
    .limit(parseInt(limit));

  res.json({ teachers });
}));

// Batch Routes
router.get('/batches', asyncHandler(async (req: Request, res: Response) => {
  const { department } = req.query;

  const filter: any = {};
  if (department) {
    filter.department = department;
  }

  const batches = await Batch.find(filter)
    .populate('department', 'name code')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.json(batches);
}));

router.get('/batches/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid batch ID', 400);
  }

  const batch = await Batch.findById(id)
    .populate('department', 'name code')
    .populate('createdBy', 'name');

  if (!batch) {
    throw createError('Batch not found', 404);
  }

  res.json(batch);
}));

router.post('/batches', validateRequest(createBatchSchema), asyncHandler(async (req: Request, res: Response) => {
  const { name, year, semester, startDate, endDate, department, isActive = true } = req.body;
  const adminId = (req as any).user.id;

  // Validate required fields
  if (!name || !year || !semester || !startDate || !endDate || !department) {
    throw createError('All fields are required', 400);
  }

  // Validate year
  if (year < 2020 || year > 2030) {
    throw createError('Year must be between 2020 and 2030', 400);
  }

  // Validate semester
  if (!['Spring', 'Summer', 'Fall'].includes(semester)) {
    throw createError('Invalid semester', 400);
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start >= end) {
    throw createError('End date must be after start date', 400);
  }

  // Validate department
  const dept = await Department.findById(department);
  if (!dept) {
    throw createError('Invalid department', 400);
  }

  // Check for duplicate batch
  const existingBatch = await Batch.findOne({
    name: name.trim(),
    year,
    semester,
    department
  });
  if (existingBatch) {
    throw createError('Batch with this name, year, semester, and department already exists', 400);
  }

  const batch = new Batch({
    name: name.trim(),
    year,
    semester,
    startDate: start,
    endDate: end,
    department,
    isActive,
    createdBy: adminId
  });

  await batch.save();
  await batch.populate([
    { path: 'department', select: 'name code' },
    { path: 'createdBy', select: 'name' }
  ]);

  res.status(201).json({
    message: 'Batch created successfully',
    batch
  });
}));

router.put('/batches/:id', validateRequest(updateBatchSchema), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, year, semester, startDate, endDate, department, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid batch ID', 400);
  }

  const batch = await Batch.findById(id);
  if (!batch) {
    throw createError('Batch not found', 404);
  }

  // Validate year if provided
  if (year && (year < 2020 || year > 2030)) {
    throw createError('Year must be between 2020 and 2030', 400);
  }

  // Validate semester if provided
  if (semester && !['Spring', 'Summer', 'Fall'].includes(semester)) {
    throw createError('Invalid semester', 400);
  }

  // Validate dates if provided
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : batch.startDate;
    const end = endDate ? new Date(endDate) : batch.endDate;
    if (start >= end) {
      throw createError('End date must be after start date', 400);
    }
  }

  // Validate department if provided
  if (department) {
    const dept = await Department.findById(department);
    if (!dept) {
      throw createError('Invalid department', 400);
    }
  }

  // Check for duplicate batch (excluding current)
  const duplicateQuery: any = { _id: { $ne: id } };
  const checkName = name || batch.name;
  const checkYear = year || batch.year;
  const checkSemester = semester || batch.semester;
  const checkDepartment = department || batch.department;

  duplicateQuery.name = checkName.trim();
  duplicateQuery.year = checkYear;
  duplicateQuery.semester = checkSemester;
  duplicateQuery.department = checkDepartment;

  const existingBatch = await Batch.findOne(duplicateQuery);
  if (existingBatch) {
    throw createError('Batch with this name, year, semester, and department already exists', 400);
  }

  // Update fields
  if (name) batch.name = name.trim();
  if (year) batch.year = year;
  if (semester) batch.semester = semester;
  if (startDate) batch.startDate = new Date(startDate);
  if (endDate) batch.endDate = new Date(endDate);
  if (department) batch.department = department;
  if (isActive !== undefined) batch.isActive = isActive;

  await batch.save();
  await batch.populate([
    { path: 'department', select: 'name code' },
    { path: 'createdBy', select: 'name' }
  ]);

  res.json({
    message: 'Batch updated successfully',
    batch
  });
}));

router.delete('/batches/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid batch ID', 400);
  }

  const batch = await Batch.findById(id);
  if (!batch) {
    throw createError('Batch not found', 404);
  }

  // Check if batch has sections
  const sectionCount = await Section.countDocuments({ batch: id });
  if (sectionCount > 0) {
    throw createError('Cannot delete batch with existing sections', 400);
  }

  await Batch.findByIdAndDelete(id);

  res.json({
    message: 'Batch deleted successfully'
  });
}));

// Section Routes
router.get('/sections', asyncHandler(async (req: Request, res: Response) => {
  const { batch, course } = req.query;

  const filter: any = {};
  if (batch) filter.batch = batch;
  if (course) filter.course = course;

  const sections = await Section.find(filter)
    .populate('batch', 'name year semester')
    .populate('course', 'name code creditHours')
    .populate('instructor', 'name email')
    .populate('moduleLeader', 'name email')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  res.json(sections);
}));

router.get('/sections/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid section ID', 400);
  }

  const section = await Section.findById(id)
    .populate('batch', 'name year semester')
    .populate('course', 'name code creditHours')
    .populate('instructor', 'name email')
    .populate('moduleLeader', 'name email')
    .populate('createdBy', 'name');

  if (!section) {
    throw createError('Section not found', 404);
  }

  res.json(section);
}));

router.post('/sections', validateRequest(createSectionSchema), asyncHandler(async (req: Request, res: Response) => {
  const {
    name,
    batch,
    course,
    instructor,
    moduleLeader,
    maxStudents,
    currentStudents = 0,
    schedule,
    isActive = true
  } = req.body;
  const adminId = (req as any).user.id;

  // Validate required fields
  if (!name || !batch || !course || !maxStudents) {
    throw createError('Name, batch, course, and max students are required', 400);
  }

  // Validate max students
  if (maxStudents < 1 || maxStudents > 200) {
    throw createError('Max students must be between 1 and 200', 400);
  }

  // Validate current students
  if (currentStudents < 0 || currentStudents > maxStudents) {
    throw createError('Current students must be between 0 and max students', 400);
  }

  // Validate batch
  const batchDoc = await Batch.findById(batch);
  if (!batchDoc) {
    throw createError('Invalid batch', 400);
  }

  // Validate course
  const courseDoc = await Course.findById(course);
  if (!courseDoc) {
    throw createError('Invalid course', 400);
  }

  // Validate instructor if provided
  if (instructor) {
    const instructorUser = await User.findOne({
      _id: instructor,
      role: { $in: ['admin', 'teacher'] }
    });
    if (!instructorUser) {
      throw createError('Invalid instructor', 400);
    }
  }

  // Validate module leader if provided
  if (moduleLeader) {
    const moduleLeaderUser = await User.findOne({
      _id: moduleLeader,
      role: { $in: ['admin', 'module-leader'] }
    });
    if (!moduleLeaderUser) {
      throw createError('Invalid module leader', 400);
    }
  }

  // Check for duplicate section
  const existingSection = await Section.findOne({
    name: name.trim(),
    batch,
    course
  });
  if (existingSection) {
    throw createError('Section with this name, batch, and course already exists', 400);
  }

  // Validate schedule if provided
  if (schedule && schedule.length > 0) {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const scheduleItem of schedule) {
      if (!validDays.includes(scheduleItem.day)) {
        throw createError('Invalid day in schedule', 400);
      }
      if (!scheduleItem.startTime || !scheduleItem.endTime) {
        throw createError('Start time and end time are required for schedule', 400);
      }
    }
  }

  const section = new Section({
    name: name.trim(),
    batch,
    course,
    instructor,
    moduleLeader,
    maxStudents,
    currentStudents,
    schedule: schedule || [],
    isActive,
    createdBy: adminId
  });

  await section.save();
  await section.populate([
    { path: 'batch', select: 'name year semester' },
    { path: 'course', select: 'name code creditHours' },
    { path: 'instructor', select: 'name email' },
    { path: 'moduleLeader', select: 'name email' },
    { path: 'createdBy', select: 'name' }
  ]);

  res.status(201).json({
    message: 'Section created successfully',
    section
  });
}));

router.put('/sections/:id', validateRequest(updateSectionSchema), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    batch,
    course,
    instructor,
    moduleLeader,
    maxStudents,
    currentStudents,
    schedule,
    isActive
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid section ID', 400);
  }

  const section = await Section.findById(id);
  if (!section) {
    throw createError('Section not found', 404);
  }

  // Validate max students if provided
  if (maxStudents && (maxStudents < 1 || maxStudents > 200)) {
    throw createError('Max students must be between 1 and 200', 400);
  }

  // Validate current students if provided
  const checkMaxStudents = maxStudents || section.maxStudents;
  if (currentStudents !== undefined && (currentStudents < 0 || currentStudents > checkMaxStudents)) {
    throw createError('Current students must be between 0 and max students', 400);
  }

  // Validate batch if provided
  if (batch) {
    const batchDoc = await Batch.findById(batch);
    if (!batchDoc) {
      throw createError('Invalid batch', 400);
    }
  }

  // Validate course if provided
  if (course) {
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      throw createError('Invalid course', 400);
    }
  }

  // Validate instructor if provided
  if (instructor) {
    const instructorUser = await User.findOne({
      _id: instructor,
      role: { $in: ['admin', 'teacher'] }
    });
    if (!instructorUser) {
      throw createError('Invalid instructor', 400);
    }
  }

  // Validate module leader if provided
  if (moduleLeader) {
    const moduleLeaderUser = await User.findOne({
      _id: moduleLeader,
      role: { $in: ['admin', 'module-leader'] }
    });
    if (!moduleLeaderUser) {
      throw createError('Invalid module leader', 400);
    }
  }

  // Check for duplicate section (excluding current)
  const checkName = name || section.name;
  const checkBatch = batch || section.batch;
  const checkCourse = course || section.course;

  const existingSection = await Section.findOne({
    name: checkName.trim ? checkName.trim() : checkName,
    batch: checkBatch,
    course: checkCourse,
    _id: { $ne: id }
  });
  if (existingSection) {
    throw createError('Section with this name, batch, and course already exists', 400);
  }

  // Validate schedule if provided
  if (schedule && schedule.length > 0) {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const scheduleItem of schedule) {
      if (!validDays.includes(scheduleItem.day)) {
        throw createError('Invalid day in schedule', 400);
      }
      if (!scheduleItem.startTime || !scheduleItem.endTime) {
        throw createError('Start time and end time are required for schedule', 400);
      }
    }
  }

  // Update fields
  if (name) section.name = name.trim();
  if (batch) section.batch = batch;
  if (course) section.course = course;
  if (instructor !== undefined) section.instructor = instructor;
  if (moduleLeader !== undefined) section.moduleLeader = moduleLeader;
  if (maxStudents) section.maxStudents = maxStudents;
  if (currentStudents !== undefined) section.currentStudents = currentStudents;
  if (schedule !== undefined) section.schedule = schedule;
  if (isActive !== undefined) section.isActive = isActive;

  await section.save();
  await section.populate([
    { path: 'batch', select: 'name year semester' },
    { path: 'course', select: 'name code creditHours' },
    { path: 'instructor', select: 'name email' },
    { path: 'moduleLeader', select: 'name email' },
    { path: 'createdBy', select: 'name' }
  ]);

  res.json({
    message: 'Section updated successfully',
    section
  });
}));

router.delete('/sections/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid section ID', 400);
  }

  const section = await Section.findById(id);
  if (!section) {
    throw createError('Section not found', 404);
  }

  await Section.findByIdAndDelete(id);

  res.json({
    message: 'Section deleted successfully'
  });
}));

router.post('/sections/assign-module-leader', asyncHandler(async (req: Request, res: Response) => {
  const { sectionId, moduleLeaderId } = req.body;

  if (!sectionId || !moduleLeaderId) {
    throw createError('Section ID and module leader ID are required', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(sectionId) || !mongoose.Types.ObjectId.isValid(moduleLeaderId)) {
    throw createError('Invalid section ID or module leader ID', 400);
  }

  // Validate section
  const section = await Section.findById(sectionId);
  if (!section) {
    throw createError('Section not found', 404);
  }

  // Validate module leader
  const moduleLeader = await User.findOne({
    _id: moduleLeaderId,
    role: { $in: ['admin', 'module-leader'] }
  });
  if (!moduleLeader) {
    throw createError('Invalid module leader', 400);
  }

  section.moduleLeader = moduleLeaderId;
  await section.save();
  await section.populate([
    { path: 'batch', select: 'name year semester' },
    { path: 'course', select: 'name code creditHours' },
    { path: 'instructor', select: 'name email' },
    { path: 'moduleLeader', select: 'name email' },
    { path: 'createdBy', select: 'name' }
  ]);

  res.json({
    message: 'Module leader assigned successfully',
    section
  });
}));

export default router;
