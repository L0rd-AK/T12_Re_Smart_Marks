import { GoogleDriveService } from './googleDriveService';
import type { GoogleDriveFile, GoogleDriveUploadProgress } from './googleDriveService';

export interface SharedDriveConfig {
  sharedDriveId: string;
  sharedDriveName: string;
  baseUrl: string;
}

export interface UploadResult {
  personal: GoogleDriveFile | null;
  shared: GoogleDriveFile | null;
  success: boolean;
  errors: string[];
}

/**
 * Enhanced service that handles both personal and shared Google Drive uploads
 */
export class SharedDriveService {
  // Shared Drive configuration
  private static readonly SHARED_DRIVE_CONFIG: SharedDriveConfig = {
    sharedDriveId: '1SA3gVLzt-jFJJ4YakCMyt5hXeyslcrg5',
    sharedDriveName: 'Smart Marks Shared Drive',
    baseUrl: 'https://drive.google.com/drive/folders/1SA3gVLzt-jFJJ4YakCMyt5hXeyslcrg5'
  };

  /**
   * Upload file to both personal drive and shared drive
   */
  static async uploadToPersonalAndShared(
    file: File,
    fileName: string,
    personalFolderId: string,
    sharedFolderPath: string, // Path structure like "2024/Spring/CSE101/Theory"
    onProgress?: (progress: GoogleDriveUploadProgress) => void
  ): Promise<UploadResult> {
    const result: UploadResult = {
      personal: null,
      shared: null,
      success: false,
      errors: []
    };

    console.log(`🔄 Starting dual upload for file: ${fileName}`);
    console.log(`📂 Personal folder ID: ${personalFolderId}`);
    console.log(`📂 Shared folder path: ${sharedFolderPath}`);

    // Upload to personal drive
    try {
      console.log('📤 Uploading to personal Google Drive...');
      result.personal = await GoogleDriveService.uploadFile(
        file,
        fileName,
        personalFolderId,
        onProgress
      );
      console.log('✅ Personal drive upload successful:', result.personal);
    } catch (error) {
      const errorMsg = `Personal drive upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌', errorMsg);
      result.errors.push(errorMsg);
    }

    // Upload to shared drive
    try {
      console.log('📤 Uploading to shared Google Drive...');
      const sharedFolderId = await this.ensureSharedFolderExists(sharedFolderPath);
      result.shared = await this.uploadToSharedDrive(file, fileName, sharedFolderId);
      console.log('✅ Shared drive upload successful:', result.shared);
    } catch (error) {
      const errorMsg = `Shared drive upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌', errorMsg);
      result.errors.push(errorMsg);
    }

    result.success = result.personal !== null || result.shared !== null;
    
    if (result.success) {
      console.log('🎉 At least one upload succeeded');
    } else {
      console.error('💥 Both uploads failed');
    }

    return result;
  }

  /**
   * Upload file directly to shared drive
   */
  static async uploadToSharedDrive(
    file: File,
    fileName: string,
    sharedFolderId: string
  ): Promise<GoogleDriveFile> {
    if (!GoogleDriveService.isSignedIn()) {
      throw new Error('User must be signed in to upload to shared drive');
    }

    console.log(`📤 Uploading ${fileName} to shared drive folder: ${sharedFolderId}`);

    const metadata = {
      name: fileName,
      parents: [sharedFolderId]
    };

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();
      
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error('Failed to parse shared drive upload response'));
          }
        } else {
          reject(new Error(`Shared drive upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Shared drive upload failed due to network error'));
      });

      // Get access token from GoogleDriveService
      const accessToken = GoogleDriveService.getAccessToken();
      if (!accessToken) {
        reject(new Error('No access token available for shared drive upload'));
        return;
      }
      
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true');
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.send(form);
    });
  }

  /**
   * Ensure shared folder structure exists and return the target folder ID
   */
  static async ensureSharedFolderExists(folderPath: string): Promise<string> {
    console.log(`📁 Ensuring shared folder structure exists: ${folderPath}`);
    
    const pathParts = folderPath.split('/').filter(part => part.trim() !== '');
    let currentFolderId = this.SHARED_DRIVE_CONFIG.sharedDriveId;
    
    for (const folderName of pathParts) {
      console.log(`🔍 Checking for folder: ${folderName} in parent: ${currentFolderId}`);
      
      // Check if folder exists
      const existingFolder = await this.findFolderInSharedDrive(folderName, currentFolderId);
      
      if (existingFolder) {
        console.log(`✅ Found existing folder: ${folderName} (${existingFolder.id})`);
        currentFolderId = existingFolder.id;
      } else {
        console.log(`🆕 Creating new folder: ${folderName}`);
        const newFolder = await this.createFolderInSharedDrive(folderName, currentFolderId);
        currentFolderId = newFolder.id;
      }
    }
    
    console.log(`🎯 Final folder ID: ${currentFolderId}`);
    return currentFolderId;
  }

  /**
   * Find a folder by name in shared drive
   */
  static async findFolderInSharedDrive(
    folderName: string, 
    parentId: string
  ): Promise<GoogleDriveFile | null> {
    if (!GoogleDriveService.isSignedIn()) {
      throw new Error('User must be signed in to search shared drive');
    }

    const accessToken = GoogleDriveService.getAccessToken();
    const query = `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name,mimeType)`;

    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!resp.ok) {
      throw new Error(`Failed to search shared drive: ${resp.status}`);
    }

    const data = await resp.json() as { files: GoogleDriveFile[] };
    return data.files.length > 0 ? data.files[0] : null;
  }

  /**
   * Create a folder in shared drive
   */
  static async createFolderInSharedDrive(
    name: string, 
    parentId: string
  ): Promise<GoogleDriveFile> {
    if (!GoogleDriveService.isSignedIn()) {
      throw new Error('User must be signed in to create shared drive folders');
    }

    const accessToken = GoogleDriveService.getAccessToken();
    const metadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };

    const resp = await fetch('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(metadata)
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`Failed to create shared drive folder "${name}": ${resp.status} - ${errorText}`);
    }

    return await resp.json() as GoogleDriveFile;
  }

  /**
   * Generate shared folder path based on course information
   */
  static generateSharedFolderPath(courseInfo: {
    semester: string;
    courseCode: string;
    courseSection: string;
    batch?: string;
    department?: string;
  }, category: 'Theory' | 'Lab'): string {
    // Extract year from semester (e.g., "Spring-2024" -> "2024")
    const year = courseInfo.semester.split('-')[1] || new Date().getFullYear().toString();
    const term = courseInfo.semester.split('-')[0] || 'Unknown';
    
    // Create path like: 2024/Spring/CSE101_A/Theory
    const folderPath = [
      year,
      term,
      `${courseInfo.courseCode}_${courseInfo.courseSection}`,
      category
    ].join('/');

    return folderPath;
  }

  /**
   * Get shared drive folder URL for display
   */
  static getSharedDriveUrl(): string {
    return this.SHARED_DRIVE_CONFIG.baseUrl;
  }

  /**
   * Get shared drive info
   */
  static getSharedDriveInfo(): SharedDriveConfig {
    return { ...this.SHARED_DRIVE_CONFIG };
  }
}
