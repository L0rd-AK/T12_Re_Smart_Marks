import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  DepartmentController,
  CourseController,
  BatchController,
  SectionController,
  AdminStatsController,
  UserController
} from '../controllers/adminController';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createCourseSchema,
  updateCourseSchema,
  createBatchSchema,
  updateBatchSchema,
  createSectionSchema,
  updateSectionSchema,
  assignModuleLeaderSchema,
  getUsersQuerySchema,
  updateUserRoleSchema,
  blockUserSchema
} from '../schemas/admin';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole(['admin']));

// Dashboard stats
router.get('/dashboard/stats', AdminStatsController.getDashboardStats);

// Department routes
router.get('/departments', DepartmentController.getDepartments);
router.get('/departments/:id', DepartmentController.getDepartment);
router.post('/departments', validateRequest(createDepartmentSchema), DepartmentController.createDepartment);
router.put('/departments/:id', validateRequest(updateDepartmentSchema), DepartmentController.updateDepartment);
router.delete('/departments/:id', DepartmentController.deleteDepartment);

// Course routes
router.get('/courses', CourseController.getCourses);
router.get('/courses/:id', CourseController.getCourse);
router.post('/courses', validateRequest(createCourseSchema), CourseController.createCourse);
router.put('/courses/:id', validateRequest(updateCourseSchema), CourseController.updateCourse);
router.delete('/courses/:id', CourseController.deleteCourse);

// Batch routes
router.get('/batches', BatchController.getBatches);
router.get('/batches/:id', BatchController.getBatch);
router.post('/batches', validateRequest(createBatchSchema), BatchController.createBatch);
router.put('/batches/:id', validateRequest(updateBatchSchema), BatchController.updateBatch);
router.delete('/batches/:id', BatchController.deleteBatch);

// Section routes
router.get('/sections', SectionController.getSections);
router.get('/sections/:id', SectionController.getSection);
router.post('/sections', validateRequest(createSectionSchema), SectionController.createSection);
router.put('/sections/:id', validateRequest(updateSectionSchema), SectionController.updateSection);
router.delete('/sections/:id', SectionController.deleteSection);

// Module leader assignment
router.post('/sections/assign-module-leader', validateRequest(assignModuleLeaderSchema), SectionController.assignModuleLeader);

// User Management Routes
router.get('/users', UserController.getUsers);
router.get('/users/stats', UserController.getUserStats);
router.put('/users/:id/role', UserController.updateUserRole);
router.put('/users/:id/block', validateRequest(blockUserSchema), UserController.blockUser);
router.put('/users/:id/unblock', UserController.unblockUser);
router.delete('/users/:id', UserController.deleteUser);

export default router;
