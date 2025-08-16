import express from 'express';
import {
  createDocumentDistribution,
  uploadFilesToDistribution,
  getDocumentDistribution,
  getDocumentDistributions,
  updateDocumentDistribution,
  updateDistributionStatus,
  deleteDocumentDistribution,
  getDistributionAnalytics,
  getSharedDocuments,
  getCourseDocumentDistributions,
  getCourseSharedDocuments
} from '../controllers/documentDistributionController';
import { authenticateToken } from '../middleware/auth';
// import { checkRole } from '../middleware/permissions';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new document distribution (Module Leaders only)
router.post(
  '/',
  // checkRole(['module-leader']),
  createDocumentDistribution
);

// Upload files to existing distribution (Module Leaders only)
router.post(
  '/:distributionId/files',
  // checkRole(['module-leader']),
  uploadFilesToDistribution
);

// Get all document distributions (with filtering and pagination)
router.get('/', getDocumentDistributions);

// Get specific document distribution by ID
router.get('/:distributionId', getDocumentDistribution);

// Get document distributions for a specific course (Module Leaders only)
router.get(
  '/course/:courseId',
  // checkRole(['module-leader']),
  getCourseDocumentDistributions
);

// Get distribution analytics (Module Leaders only)
router.get(
  '/:distributionId/analytics',
  // checkRole(['module-leader']),
  getDistributionAnalytics
);

// Update document distribution (Module Leaders only)
router.put(
  '/:distributionId',
  // checkRole(['module-leader']),
  updateDocumentDistribution
);

// Update distribution status (Module Leaders only)
router.patch(
  '/:distributionId/status',
  // checkRole(['module-leader']),
  updateDistributionStatus
);

// Delete/Archive document distribution (Module Leaders only)
router.delete(
  '/:distributionId',
  // checkRole(['module-leader']),
  deleteDocumentDistribution
);

// Get shared documents for teachers
router.get(
  '/shared/teacher',
  getSharedDocuments
);

// Get shared documents for a specific course (for teachers)
router.get(
  '/shared/course/:courseId',
  getCourseSharedDocuments
);

export default router;
