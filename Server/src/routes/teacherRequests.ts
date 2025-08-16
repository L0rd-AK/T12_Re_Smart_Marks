import express from 'express';
import {
    getCourseRequests,
    updateCourseRequestStatus,
    getDocumentSubmissionRequests,
    updateDocumentSubmissionStatus,
    shareDocumentsWithTeacher
} from '../controllers/teacherRequestsController';
import { authenticate, requireRole } from '../middleware/auth';
import { updateCourseRequestStatusValidation, updateDocumentSubmissionStatusValidation } from '../schemas/teacherRequests';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Module leader routes for managing teacher requests
router.get('/', requireRole(['module-leader']), getCourseRequests);
router.patch('/:requestId/status', updateCourseRequestStatusValidation, requireRole(['module-leader']), updateCourseRequestStatus);

export default router;
