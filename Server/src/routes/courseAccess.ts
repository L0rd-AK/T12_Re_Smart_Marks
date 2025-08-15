import express from 'express';
import {
    createAccessRequest,
    getMyRequests,
    getPendingRequests,
    getAllRequestsForModuleLeader,
    respondToRequest,
    getAccessibleCourses,
    getDepartmentCourses,
    createRequestValidation,
    respondToRequestValidation
} from '../controllers/courseAccessController';
import { authenticate, requireRole } from '../middleware/auth';


const router = express.Router();



// Apply authentication to all routes
router.use(authenticate);

// Teacher routes
router.post('/request', createRequestValidation, requireRole(['teacher']), createAccessRequest);
router.get('/my-requests', requireRole(['teacher','module-leader']), getMyRequests);
router.get('/my-courses', requireRole(['teacher', 'module-leader']), getAccessibleCourses);
router.get('/department-courses', requireRole(['teacher', 'module-leader']), getDepartmentCourses);

// Module leader routes
router.get('/pending-requests', requireRole(['module-leader']), getPendingRequests);
router.get('/all-requests', requireRole(['module-leader']), getAllRequestsForModuleLeader);
router.patch('/respond/:requestId', respondToRequestValidation, requireRole(['module-leader']), respondToRequest);

export default router;
