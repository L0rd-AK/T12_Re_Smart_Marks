import express from 'express';
import {
  getCourses,
  getCourse,
  getCoursesByDepartment,
  getCoursesByModuleLeader,
  getCoursesByYearSemester,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  assignModuleLeader,
  addPrerequisites,
  removePrerequisites,
  searchCourses,
  getCourseStatistics,
  bulkCreateCourses,
  exportCourses,
} from '../controllers/courseController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Public routes (for authenticated users)
router.get('/', getCourses);
router.get('/search', searchCourses);
router.get('/statistics', getCourseStatistics);
router.get('/export', exportCourses);
router.get('/:id', getCourse);
router.get('/department/:departmentId', getCoursesByDepartment);
router.get('/module-leader/:moduleLeaderId', getCoursesByModuleLeader);
router.get('/year/:year/semester/:semester', getCoursesByYearSemester);

// Admin and Module Leader routes
router.post('/', requireRole(['admin', 'module-leader']), createCourse);
router.put('/:id', requireRole(['admin', 'module-leader']), updateCourse);
router.delete('/:id', requireRole(['admin']), deleteCourse);
router.patch('/:id/toggle-status', requireRole(['admin', 'module-leader']), toggleCourseStatus);
router.patch('/:courseId/assign-module-leader', requireRole(['admin']), assignModuleLeader);

// Prerequisites management
router.post('/:courseId/prerequisites', requireRole(['admin', 'module-leader']), addPrerequisites);
router.delete('/:courseId/prerequisites', requireRole(['admin', 'module-leader']), removePrerequisites);

// Bulk operations (Admin only)
router.post('/bulk', requireRole(['admin']), bulkCreateCourses);

export default router;
