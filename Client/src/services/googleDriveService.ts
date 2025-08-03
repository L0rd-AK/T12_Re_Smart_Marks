// New interfaces for Google Identity Services (GIS)
interface TokenResponse {
  access_token: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

interface TokenClient {
  requestAccessToken(overrideConfig?: { scope?: string }): void;
}

interface GoogleAccounts {
  oauth2: {
    initTokenClient(config: {
      client_id: string;
      scope: string;
      callback: (tokenResponse: TokenResponse) => void;
    }): TokenClient;
    revoke(token: string, done: () => void): void;
  };
}

declare const google: {
  accounts: GoogleAccounts;
};

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface GoogleUserProfile {
  resourceName: string;
  names?: { displayName: string; }[];
  emailAddresses?: { value: string; }[];
  photos?: { url: string; }[];
}

export interface GoogleDriveUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class GoogleDriveService {
  private static readonly SCOPES = 'https://www.googleapis.com/auth/drive.file';
  private static readonly STORAGE_KEY = 'google_drive_access_token';
  private static readonly TOKEN_EXPIRY_KEY = 'google_drive_token_expiry';
  private static isInitialized = false;
  private static tokenClient: TokenClient | null = null;
  private static accessToken: string | null = null;

  private static loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize Google API and load Drive API
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadScript('https://accounts.google.com/gsi/client');
      
      // Check for existing valid token in localStorage
      this.loadStoredToken();
      
      this.isInitialized = true;
      console.log('🔄 Google Drive Service initialized. Token available:', !!this.accessToken);
    } catch (error) {
      console.error('Failed to initialize Google Drive Service', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Load stored access token from localStorage
   */
  private static loadStoredToken(): void {
    try {
      const storedToken = localStorage.getItem(this.STORAGE_KEY);
      const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
      
      if (storedToken && expiryTime) {
        const now = Date.now();
        const expiry = parseInt(expiryTime, 10);
        
        if (now < expiry) {
          this.accessToken = storedToken;
          console.log('✅ Restored Google Drive access token from storage');
        } else {
          console.log('⏰ Stored Google Drive token has expired, clearing...');
          this.clearStoredToken();
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load stored Google Drive token:', error);
      this.clearStoredToken();
    }
  }

  /**
   * Store access token in localStorage with expiry
   */
  private static storeToken(token: string): void {
    try {
      // Google access tokens typically expire in 1 hour (3600 seconds)
      // We'll set expiry to 55 minutes to be safe
      const expiryTime = Date.now() + (55 * 60 * 1000);
      
      localStorage.setItem(this.STORAGE_KEY, token);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      console.log('💾 Google Drive access token stored successfully');
    } catch (error) {
      console.warn('⚠️ Failed to store Google Drive token:', error);
    }
  }

  /**
   * Clear stored token from localStorage
   */
  private static clearStoredToken(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.warn('⚠️ Failed to clear stored Google Drive token:', error);
    }
  }

  /**
   * Sign in to Google and request Drive access
   */
  static async signIn(): Promise<void> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        reject(new Error('Google Client ID not found in environment variables'));
        return;
      }

      console.log('🔐 Initializing Google OAuth token client...');

      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: this.SCOPES,
        callback: (tokenResponse: TokenResponse) => {
          console.log('📝 Token response received:', { 
            hasAccessToken: !!tokenResponse.access_token,
            error: tokenResponse.error 
          });
          
          if (tokenResponse.error) {
            console.error('❌ Google sign-in error:', tokenResponse.error_description);
            reject(new Error(`Google sign-in error: ${tokenResponse.error_description}`));
            return;
          }
          
          if (!tokenResponse.access_token) {
            console.error('❌ No access token received');
            reject(new Error('No access token received from Google'));
            return;
          }
          
          this.accessToken = tokenResponse.access_token;
          this.storeToken(tokenResponse.access_token);
          console.log('✅ Access token stored successfully');
          resolve();
        },
      });

      console.log('🚀 Requesting access token...');
      this.tokenClient.requestAccessToken();
    });
  }

  /**
   * Sign out from Google
   */
  static async signOut(): Promise<void> {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken, () => {});
      this.accessToken = null;
      this.clearStoredToken();
      console.log('🔐 Google Drive sign out completed and token cleared');
    }
  }

  /**
   * Check if user is currently signed in and token is valid
   */
  static isSignedIn(): boolean {
    if (!this.accessToken) return false;
    
    // Check if token has expired
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (expiryTime) {
      const now = Date.now();
      const expiry = parseInt(expiryTime, 10);
      
      if (now >= expiry) {
        console.log('⏰ Google Drive token has expired');
        this.accessToken = null;
        this.clearStoredToken();
        return false;
      }
    }
    
    return true;
  }

  /**
   * Validate the current token by making a test API call
   */
  static async validateToken(): Promise<boolean> {
    if (!this.accessToken) return false;
    
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      
      if (!response.ok) {
        console.log('🔍 Google Drive token validation failed, clearing token');
        this.accessToken = null;
        this.clearStoredToken();
        return false;
      }
      
      console.log('✅ Google Drive token is valid');
      return true;
    } catch (error) {
      console.warn('⚠️ Error validating Google Drive token:', error);
      this.accessToken = null;
      this.clearStoredToken();
      return false;
    }
  }

  /**
   * Make an authenticated API request with automatic token validation
   */
  private static async makeAuthenticatedRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    await this.initialize();
    
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to make API requests');
    }

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // If we get a 401 (Unauthorized), the token might have expired
    if (response.status === 401) {
      console.log('🔑 Received 401 - token may have expired, clearing stored token');
      this.accessToken = null;
      this.clearStoredToken();
      throw new Error('Authentication failed - please sign in again');
    }

    return response;
  }

  /**
   * Get current user's profile (Note: GIS doesn't provide user profile directly like gapi.auth2)
   * This method will need to be adapted, perhaps by calling the People API
   */
  static async getCurrentUserProfile(): Promise<GoogleUserProfile | null> {
    if (!this.isSignedIn()) return null;
    
    try {
      const response = await this.makeAuthenticatedRequest(
        'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return (await response.json()) as GoogleUserProfile;
    } catch (error) {
      console.warn('⚠️ Failed to get user profile:', error);
      return null;
    }
  }


  /**
   * Upload a file to Google Drive with progress tracking
   */
  static async uploadFile(
    file: File, 
    fileName?: string,
    folderId?: string,
    onProgress?: (progress: GoogleDriveUploadProgress) => void
  ): Promise<GoogleDriveFile> {
    await this.initialize();
    
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to upload files');
    }

    const metadata = {
      name: fileName || file.name,
      parents: folderId ? [folderId] : undefined
    };

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();
      
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: GoogleDriveUploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      if (!this.accessToken) {
        reject(new Error('User not signed in or access token is missing.'));
        return;
      }
      
      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
      xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      xhr.send(form);
    });
  }

  /**
   * Create a folder in Google Drive
   */
  static async createFolder(name: string, parentId?: string): Promise<GoogleDriveFile> {
    console.log(`📁 Creating folder: "${name}" with parent: ${parentId || 'root'}`);
    
    const body = JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    });
    
    console.log('📝 Request body:', body);
    
    const resp = await this.makeAuthenticatedRequest('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });
    
    console.log('📤 Response status:', resp.status, resp.statusText);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('❌ Failed to create folder. Response:', errorText);
      throw new Error(`Failed to create folder "${name}": ${resp.status} ${resp.statusText} - ${errorText}`);
    }
    
    const result = (await resp.json()) as GoogleDriveFile;
    console.log('✅ Folder created successfully:', result);
    return result;
  }

  /**
   * Create structured folder path for Smart Marks course files with Theory/Lab subfolders
   */
  static async createCourseFolder(courseInfo: {
    courseCode: string;
    courseSection: string;
    batch?: string;
    department?: string;
    semester?: string;
  }): Promise<string> {
    console.log('🏗️ GoogleDriveService.createCourseFolder called with:', courseInfo);
    
    await this.initialize();
    
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to create folders');
    }

    // Create folder structure: smart-mark/department/semester/batch-XX/courseCode/courseSection
    const batchFormatted = courseInfo.batch ? `batch-${courseInfo.batch}` : 'batch';
    const folderStructure = [
      'smart-mark',
      courseInfo.department || 'department',
      courseInfo.semester || 'semester',
      batchFormatted,
      courseInfo.courseCode,
      courseInfo.courseSection
    ];

    console.log('📁 Folder structure to create:', folderStructure);

    let currentParentId: string | undefined = undefined;

    // Create each folder in the hierarchy
    for (let i = 0; i < folderStructure.length; i++) {
      const folderName = folderStructure[i];
      console.log(`📂 Processing folder ${i + 1}/${folderStructure.length}: "${folderName}" (parent: ${currentParentId || 'root'})`);
      
      try {
        // Check if folder already exists
        const existingFolder = await this.findFolderByName(folderName, currentParentId);
        
        if (existingFolder) {
          console.log(`✅ Found existing folder: ${folderName} (${existingFolder.id})`);
          currentParentId = existingFolder.id;
        } else {
          // Create new folder
          console.log(`🆕 Creating new folder: ${folderName}`);
          const newFolder = await this.createFolder(folderName, currentParentId);
          console.log(`✅ Created folder: ${folderName} (${newFolder.id})`);
          currentParentId = newFolder.id;
        }
      } catch (error) {
        console.error(`❌ Error processing folder "${folderName}":`, error);
        throw new Error(`Failed to create/find folder "${folderName}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log('🎉 Course folder structure created successfully. Final folder ID:', currentParentId);
    return currentParentId!;
  }

  /**
   * Create category-specific folder (Theory/Lab) within the course folder
   */
  static async createCategoryFolder(
    courseFolderId: string,
    category: 'theory' | 'lab' | 'general'
  ): Promise<string> {
    console.log(`📂 Creating ${category} folder in course folder: ${courseFolderId}`);
    
    await this.initialize();
    
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to create folders');
    }

    // For general category, return the course folder itself
    if (category === 'general') {
      console.log('✅ Using course folder for general category:', courseFolderId);
      return courseFolderId;
    }

    const folderName = category === 'theory' ? 'Theory' : 'Lab';
    
    try {
      // Check if category folder already exists
      const existingFolder = await this.findFolderByName(folderName, courseFolderId);
      
      if (existingFolder) {
        console.log(`✅ Found existing ${category} folder: ${existingFolder.id}`);
        return existingFolder.id;
      } else {
        // Create new category folder
        console.log(`🆕 Creating new ${category} folder: ${folderName}`);
        const newFolder = await this.createFolder(folderName, courseFolderId);
        console.log(`✅ Created ${category} folder: ${newFolder.id}`);
        return newFolder.id;
      }
    } catch (error) {
      console.error(`❌ Error creating ${category} folder:`, error);
      throw new Error(`Failed to create ${category} folder: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Find a folder by name in a specific parent folder
   */
  static async findFolderByName(name: string, parentId?: string): Promise<GoogleDriveFile | null> {
    await this.initialize();
    
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to search folders');
    }

    let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    
    if (!resp.ok) throw new Error('Failed to search folders');
    const data = (await resp.json()) as { files: GoogleDriveFile[] };
    
    return data.files.length > 0 ? data.files[0] : null;
  }

  /**
   * Upload a file to a specific folder with progress tracking
   */
  static async uploadFileToFolder(
    file: File,
    folderId: string,
    fileName?: string,
    onProgress?: (progress: GoogleDriveUploadProgress) => void
  ): Promise<GoogleDriveFile> {
    return this.uploadFile(file, fileName, folderId, onProgress);
  }

  /**
   * List files in user's Drive (only files created by this app)
   */
  static async listFiles(folderId?: string): Promise<GoogleDriveFile[]> {
    await this.initialize();
    
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to list files');
    }

    let url = 'https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink)&orderBy=modifiedTime desc';
    if (folderId) url += `&q='${folderId}'+in+parents`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    if (!resp.ok) throw new Error('Failed to list files');
    const data = (await resp.json()) as { files: GoogleDriveFile[] };
    return data.files || [];
  }

  /**
   * Delete a file from Google Drive
   */
  static async deleteFile(fileId: string): Promise<void> {
    await this.initialize();
    
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to delete files');
    }

    const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    if (!resp.ok) throw new Error('Failed to delete file');
  }

  /**
   * Get file download URL
   */
  static async getDownloadUrl(fileId: string): Promise<string> {
    await this.initialize();
    
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to download files');
    }

    const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webContentLink`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    if (!resp.ok) throw new Error('Failed to get download URL');
    const data = await resp.json() as { webContentLink?: string };
    if (!data.webContentLink) throw new Error('File download link not available');
    return data.webContentLink;
  }

  /**
   * Share a file and get shareable link
   */
  static async shareFile(fileId: string, makePublic: boolean = false): Promise<string> {
    await this.initialize();
    
    if (!this.isSignedIn()) {
      throw new Error('User must be signed in to share files');
    }

    if (makePublic) {
      const perm = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' })
      });
      if (!perm.ok) throw new Error('Failed to share file');
    }

    const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=webViewLink`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    if (!resp.ok) throw new Error('Failed to get share link');
    const data = await resp.json() as { webViewLink?: string };
    if (!data.webViewLink) throw new Error('File share link not available');
    return data.webViewLink;
  }
}
