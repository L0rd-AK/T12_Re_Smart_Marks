import express from 'express';
import { 
  storeGoogleDriveFile, 
  getUserGoogleDriveFiles, 
  verifyGoogleDriveFile,
  getGoogleDriveDownloadLink 
} from '../controllers/googleDriveController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Store Google Drive file metadata
router.post('/store-file', authenticate, storeGoogleDriveFile);

// Get user's Google Drive files for a specific document
router.get('/files/:documentId', authenticate, getUserGoogleDriveFiles);

// Verify Google Drive file access
router.post('/verify-file', authenticate, verifyGoogleDriveFile);

// Get Google Drive file download link
router.post('/download-link/:fileId', authenticate, getGoogleDriveDownloadLink);

export default router;
