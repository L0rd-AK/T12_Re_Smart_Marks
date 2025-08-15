import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { DocumentController } from '../controllers/documentController';

const router = Router();

// Teacher/User routes (require authentication)
router.use(authenticate);

// Get all submissions for the current user
router.get('/submissions', DocumentController.getDocumentSubmissions);

// Clean up duplicate submissions
router.post('/submissions/cleanup-duplicates', DocumentController.cleanupDuplicateSubmissions);

// Get current or create new submission for a course
router.get('/submissions/current', DocumentController.getCurrentOrCreateSubmission);

// Get a specific submission
router.get('/submissions/:id', DocumentController.getDocumentSubmission);

// Save/update document submission
router.post('/submissions', DocumentController.saveDocumentSubmission);

// Update individual document status within a submission
router.patch('/submissions/:submissionId/documents', DocumentController.updateDocumentStatus);

// Submit final submission
router.post('/submissions/:submissionId/submit', DocumentController.submitDocumentSubmission);

// Delete a submission (only drafts and partial)
router.delete('/submissions/:id', DocumentController.deleteDocumentSubmission);

// Admin/Module Leader routes (require additional permissions)
router.get('/submissions/review/all', 
  DocumentController.getAllSubmissionsForReview
);

router.patch('/submissions/:id/review', 
  DocumentController.updateSubmissionReviewStatus
);

export default router;
