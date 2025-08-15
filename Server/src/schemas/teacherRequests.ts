import { body, param } from 'express-validator';

// Validation for updating course request status
export const updateCourseRequestStatusValidation = [
  param('requestId')
    .isMongoId()
    .withMessage('Invalid request ID'),
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('reviewComments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review comments must be less than 1000 characters')
];

// Validation for updating document submission status
export const updateDocumentSubmissionStatusValidation = [
  param('submissionId')
    .isMongoId()
    .withMessage('Invalid submission ID'),
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('reviewComments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review comments must be less than 1000 characters')
];
