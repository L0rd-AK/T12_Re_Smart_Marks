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
import { authenticateToken } from '../middleware/auth';
import { checkRole } from '../middleware/permissions';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

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
router.post('/', checkRole(['admin', 'module-leader']), createCourse);
router.put('/:id', checkRole(['admin', 'module-leader']), updateCourse);
router.delete('/:id', checkRole(['admin']), deleteCourse);
router.patch('/:id/toggle-status', checkRole(['admin', 'module-leader']), toggleCourseStatus);
router.patch('/:courseId/assign-module-leader', checkRole(['admin']), assignModuleLeader);

// Prerequisites management
router.post('/:courseId/prerequisites', checkRole(['admin', 'module-leader']), addPrerequisites);
router.delete('/:courseId/prerequisites', checkRole(['admin', 'module-leader']), removePrerequisites);

// Bulk operations (Admin only)
router.post('/bulk', checkRole(['admin']), bulkCreateCourses);

export default router;
