import { google } from 'googleapis';

export class GoogleDriveService {
  private static drive: any;

  /**
   * Initialize Google Drive service
   */
  static async initialize() {
    try {
      // Initialize Google Drive API
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      console.log('✅ Google Drive Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive Service:', error);
      throw error;
    }
  }

  /**
   * Create a folder in Google Drive
   */
  static async createFolder(folderName: string, parentFolderId?: string): Promise<string> {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentFolderId && { parents: [parentFolderId] }),
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });

      console.log(`✅ Folder created: ${folderName} (ID: ${folder.data.id})`);
      return folder.data.id;
    } catch (error) {
      console.error(`❌ Failed to create folder ${folderName}:`, error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  /**
   * Upload a file to Google Drive
   */
  static async uploadFile(fileName: string, filePath: string, mimeType: string, parentFolderId?: string): Promise<string> {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      const fileMetadata = {
        name: fileName,
        ...(parentFolderId && { parents: [parentFolderId] }),
      };

      const media = {
        mimeType,
        body: require('fs').createReadStream(filePath),
      };

      const file = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });

      console.log(`✅ File uploaded: ${fileName} (ID: ${file.data.id})`);
      return file.data.id;
    } catch (error) {
      console.error(`❌ Failed to upload file ${fileName}:`, error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Get file information
   */
  static async getFileInfo(fileId: string) {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      const file = await this.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink',
      });

      return file.data;
    } catch (error) {
      console.error(`❌ Failed to get file info for ${fileId}:`, error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Delete a file or folder
   */
  static async deleteFile(fileId: string): Promise<void> {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      await this.drive.files.delete({
        fileId,
      });

      console.log(`✅ File deleted: ${fileId}`);
    } catch (error) {
      console.error(`❌ Failed to delete file ${fileId}:`, error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * List files in a folder
   */
  static async listFiles(folderId: string, pageSize: number = 10) {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        pageSize,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink)',
      });

      return response.data.files;
    } catch (error) {
      console.error(`❌ Failed to list files in folder ${folderId}:`, error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Update file permissions
   */
  static async updatePermissions(fileId: string, emailAddress: string, role: string = 'reader'): Promise<void> {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      const permission = {
        type: 'user',
        role,
        emailAddress,
      };

      await this.drive.permissions.create({
        fileId,
        requestBody: permission,
      });

      console.log(`✅ Permissions updated for ${emailAddress} on file ${fileId}`);
    } catch (error) {
      console.error(`❌ Failed to update permissions for ${emailAddress} on file ${fileId}:`, error);
      throw new Error(`Failed to update permissions: ${error.message}`);
    }
  }

  /**
   * Generate a shareable link
   */
  static async generateShareableLink(fileId: string): Promise<string> {
    try {
      if (!this.drive) {
        await this.initialize();
      }

      // Make the file publicly accessible
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Get the file to get the webViewLink
      const file = await this.drive.files.get({
        fileId,
        fields: 'webViewLink',
      });

      return file.data.webViewLink;
    } catch (error) {
      console.error(`❌ Failed to generate shareable link for ${fileId}:`, error);
      throw new Error(`Failed to generate shareable link: ${error.message}`);
    }
  }
}
