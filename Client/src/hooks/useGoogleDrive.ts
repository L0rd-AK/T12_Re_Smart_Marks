import { useState, useEffect, useCallback } from 'react';
import { GoogleDriveService } from '../services/googleDriveService';
import type { GoogleDriveFile, GoogleDriveUploadProgress } from '../services/googleDriveService';
import { toast } from 'sonner';

export interface GoogleDriveAuth {
  isSignedIn: boolean;
  isLoading: boolean;
  userProfile: unknown;
  error: string | null;
}

export interface UseGoogleDriveReturn {
  auth: GoogleDriveAuth;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  uploadFile: (file: File, fileName?: string, folderId?: string) => Promise<GoogleDriveFile | null>;
  createFolder: (name: string, parentId?: string) => Promise<GoogleDriveFile | null>;
  listFiles: (folderId?: string) => Promise<GoogleDriveFile[]>;
  deleteFile: (fileId: string) => Promise<boolean>;
  shareFile: (fileId: string, makePublic?: boolean) => Promise<string | null>;
  uploadProgress: GoogleDriveUploadProgress | null;
}

export const useGoogleDrive = (): UseGoogleDriveReturn => {
  const [auth, setAuth] = useState<GoogleDriveAuth>({
    isSignedIn: false,
    isLoading: true,
    userProfile: null,
    error: null
  });

  const [uploadProgress, setUploadProgress] = useState<GoogleDriveUploadProgress | null>(null);

  // Initialize Google Drive API on component mount
  useEffect(() => {
    const initializeGoogleDrive = async () => {
      try {
        console.log('🔄 Initializing Google Drive...');
        await GoogleDriveService.initialize();
        
        let isSignedIn = GoogleDriveService.isSignedIn();
        console.log('📊 Google Drive initial check. isSignedIn:', isSignedIn);
        
        // If we think we're signed in, validate the token
        if (isSignedIn) {
          console.log('🔍 Validating stored Google Drive token...');
          isSignedIn = await GoogleDriveService.validateToken();
          console.log('🔍 Token validation result:', isSignedIn);
        }
        
        let userProfile = null;
        if (isSignedIn) {
          try {
            userProfile = await GoogleDriveService.getCurrentUserProfile();
            console.log('👤 User profile loaded:', !!userProfile);
          } catch (error) {
            console.warn('⚠️ Failed to load user profile:', error);
            // If profile loading fails, the token might be invalid
            isSignedIn = false;
          }
        }

        setAuth({
          isSignedIn,
          isLoading: false,
          userProfile,
          error: null
        });
      } catch (error) {
        console.error('❌ Failed to initialize Google Drive:', error);
        setAuth({
          isSignedIn: false,
          isLoading: false,
          userProfile: null,
          error: 'Failed to initialize Google Drive API'
        });
      }
    };

    initializeGoogleDrive();
  }, []);

  const signIn = useCallback(async () => {
    try {
      console.log('🔐 Starting Google Drive sign in...');
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));
      
      await GoogleDriveService.signIn();
      console.log('✅ Google Drive sign in successful');
      
      let userProfile = null;
      try {
        userProfile = await GoogleDriveService.getCurrentUserProfile();
        console.log('👤 User profile loaded after sign in:', !!userProfile);
      } catch (error) {
        console.warn('⚠️ Failed to load user profile after sign in:', error);
      }
      
      setAuth({
        isSignedIn: true,
        isLoading: false,
        userProfile,
        error: null
      });

      toast.success('Successfully connected to Google Drive!');
    } catch (error) {
      console.error('❌ Google Drive sign in failed:', error);
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to sign in to Google Drive'
      }));
      toast.error('Failed to connect to Google Drive');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await GoogleDriveService.signOut();
      
      setAuth({
        isSignedIn: false,
        isLoading: false,
        userProfile: null,
        error: null
      });

      toast.success('Disconnected from Google Drive');
    } catch (error) {
      console.error('Google Drive sign out failed:', error);
      toast.error('Failed to disconnect from Google Drive');
    }
  }, []);

  const uploadFile = useCallback(async (
    file: File, 
    fileName?: string, 
    folderId?: string
  ): Promise<GoogleDriveFile | null> => {
    if (!auth.isSignedIn) {
      toast.error('Please sign in to Google Drive first');
      return null;
    }

    try {
      setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

      const uploadedFile = await GoogleDriveService.uploadFile(
        file,
        fileName,
        folderId,
        (progress) => setUploadProgress(progress)
      );

      setUploadProgress(null);
      toast.success(`File "${uploadedFile.name}" uploaded successfully!`);
      return uploadedFile;
    } catch (error) {
      console.error('File upload failed:', error);
      setUploadProgress(null);
      toast.error('Failed to upload file to Google Drive');
      return null;
    }
  }, [auth.isSignedIn]);

  const createFolder = useCallback(async (
    name: string, 
    parentId?: string
  ): Promise<GoogleDriveFile | null> => {
    if (!auth.isSignedIn) {
      toast.error('Please sign in to Google Drive first');
      return null;
    }

    try {
      const folder = await GoogleDriveService.createFolder(name, parentId);
      toast.success(`Folder "${folder.name}" created successfully!`);
      return folder;
    } catch (error) {
      console.error('Folder creation failed:', error);
      toast.error('Failed to create folder in Google Drive');
      return null;
    }
  }, [auth.isSignedIn]);

  const listFiles = useCallback(async (folderId?: string): Promise<GoogleDriveFile[]> => {
    if (!auth.isSignedIn) {
      toast.error('Please sign in to Google Drive first');
      return [];
    }

    try {
      return await GoogleDriveService.listFiles(folderId);
    } catch (error) {
      console.error('Failed to list files:', error);
      toast.error('Failed to load files from Google Drive');
      return [];
    }
  }, [auth.isSignedIn]);

  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    if (!auth.isSignedIn) {
      toast.error('Please sign in to Google Drive first');
      return false;
    }

    try {
      await GoogleDriveService.deleteFile(fileId);
      toast.success('File deleted successfully!');
      return true;
    } catch (error) {
      console.error('File deletion failed:', error);
      toast.error('Failed to delete file from Google Drive');
      return false;
    }
  }, [auth.isSignedIn]);

  const shareFile = useCallback(async (
    fileId: string, 
    makePublic: boolean = false
  ): Promise<string | null> => {
    if (!auth.isSignedIn) {
      toast.error('Please sign in to Google Drive first');
      return null;
    }

    try {
      const shareLink = await GoogleDriveService.shareFile(fileId, makePublic);
      toast.success('File share link generated!');
      return shareLink;
    } catch (error) {
      console.error('File sharing failed:', error);
      toast.error('Failed to share file from Google Drive');
      return null;
    }
  }, [auth.isSignedIn]);

  return {
    auth,
    signIn,
    signOut,
    uploadFile,
    createFolder,
    listFiles,
    deleteFile,
    shareFile,
    uploadProgress
  };
};
