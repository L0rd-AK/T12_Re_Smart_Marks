import { Request, Response } from 'express';
import { google } from 'googleapis';

interface GoogleDriveFileData {
  documentId: string;
  fileName: string;
  fileType: string;
  googleDriveFileId: string;
  googleDriveLink: string;
  uploadedAt: Date;
  userId: string;
}

// Store Google Drive file metadata
export const storeGoogleDriveFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      documentId, 
      fileName, 
      fileType, 
      googleDriveFileId, 
      googleDriveLink 
    } = req.body;

    // Get user ID from authenticated request
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    // Validate required fields
    if (!documentId || !fileName || !fileType || !googleDriveFileId) {
      res.status(400).json({
        success: false,
        message: 'Missing required file information'
      });
      return;
    }

    // Here you would typically save to your database
    // For now, we'll just return success
    const fileMetadata: GoogleDriveFileData = {
      documentId,
      fileName,
      fileType,
      googleDriveFileId,
      googleDriveLink,
      uploadedAt: new Date(),
      userId
    };

    console.log('Google Drive file metadata:', fileMetadata);

    res.status(200).json({
      success: true,
      message: 'Google Drive file metadata stored successfully',
      data: fileMetadata
    });

  } catch (error) {
    console.error('Error storing Google Drive file metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store file metadata'
    });
  }
};

// Get user's Google Drive files for a specific document
export const getUserGoogleDriveFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return;
    }

    // Here you would query your database for files
    // For now, return empty array
    res.status(200).json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files'
    });
  }
};

// Verify Google Drive file access
export const verifyGoogleDriveFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId, accessToken } = req.body;

    if (!fileId || !accessToken) {
      res.status(400).json({
        success: false,
        message: 'Missing file ID or access token'
      });
      return;
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Create Drive API instance
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Verify file exists and user has access
      const fileResponse = await drive.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime'
      });

      res.status(200).json({
        success: true,
        message: 'File verified successfully',
        data: fileResponse.data
      });

    } catch (driveError: any) {
      if (driveError.code === 404) {
        res.status(404).json({
          success: false,
          message: 'File not found or access denied'
        });
        return;
      }
      throw driveError;
    }

  } catch (error) {
    console.error('Error verifying Google Drive file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify file'
    });
  }
};

// Get Google Drive file download link
export const getGoogleDriveDownloadLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const { accessToken } = req.body;

    if (!fileId || !accessToken) {
      res.status(400).json({
        success: false,
        message: 'Missing file ID or access token'
      });
      return;
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Create Drive API instance
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileResponse = await drive.files.get({
      fileId: fileId,
      fields: 'webViewLink,webContentLink'
    });

    res.status(200).json({
      success: true,
      data: {
        viewLink: fileResponse.data.webViewLink,
        downloadLink: fileResponse.data.webContentLink
      }
    });

  } catch (error) {
    console.error('Error getting download link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get download link'
    });
  }
};
