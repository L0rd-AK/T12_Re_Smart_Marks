import React, { useState, useEffect } from 'react';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { toast } from 'sonner';
import { GoogleDriveService } from '../services/googleDriveService';

interface CourseInfo {
  courseCode: string;
  batch: string;
  department: string;
  semester: string;
  courseSection: string;
}

interface GoogleDriveConnectionProps {
  courseInfo: CourseInfo;
  onFoldersCreated?: (theoryFolderId: string, labFolderId: string) => void;
}

const GoogleDriveConnection: React.FC<GoogleDriveConnectionProps> = ({
  courseInfo,
  onFoldersCreated
}) => {
  const { auth, signIn, signOut } = useGoogleDrive();
  const [isCreatingFolders, setIsCreatingFolders] = useState(false);
  const [foldersCreated, setFoldersCreated] = useState(false);
  const [theoryFolderId, setTheoryFolderId] = useState<string | null>(null);
  const [labFolderId, setLabFolderId] = useState<string | null>(null);

  // Auto-create folders when user signs in and course info is available
  useEffect(() => {
    const createCourseStructure = async () => {
      if (!auth.isSignedIn) {
        console.log('❌ User not signed in to Google Drive');
        setFoldersCreated(false);
        setTheoryFolderId(null);
        setLabFolderId(null);
        return;
      }
      
      if (!courseInfo.courseCode || !courseInfo.courseSection) {
        console.log('❌ Missing required course info:', { courseCode: courseInfo.courseCode, courseSection: courseInfo.courseSection });
        toast.error('Please enter Course Code and Section before connecting to Google Drive');
        return;
      }
      
      if (foldersCreated && theoryFolderId && labFolderId) {
        console.log('✅ Folders already created:', { theoryFolderId, labFolderId });
        return;
      }
      
      if (isCreatingFolders) {
        console.log('⏳ Already creating folders...');
        return;
      }

      console.log('🚀 Starting course folder structure creation...', courseInfo);
      setIsCreatingFolders(true);
      
      try {
        // Create main course folder structure
        console.log('📁 Creating course folder structure...');
        const baseFolderId = await GoogleDriveService.createCourseFolder({
          courseCode: courseInfo.courseCode,
          courseSection: courseInfo.courseSection,
          batch: courseInfo.batch,
          department: courseInfo.department,
          semester: courseInfo.semester
        });
        
        console.log('✅ Course base folder created:', baseFolderId);
        
        // Create Theory folder
        console.log('📂 Creating Theory folder...');
        const theoryId = await GoogleDriveService.createCategoryFolder(baseFolderId, 'theory');
        setTheoryFolderId(theoryId);
        console.log('✅ Theory folder created:', theoryId);
        
        // Create Lab folder
        console.log('📂 Creating Lab folder...');
        const labId = await GoogleDriveService.createCategoryFolder(baseFolderId, 'lab');
        setLabFolderId(labId);
        console.log('✅ Lab folder created:', labId);
        
        setFoldersCreated(true);
        
        // Notify parent component
        onFoldersCreated?.(theoryId, labId);
        
        const batchFormatted = courseInfo.batch ? `batch-${courseInfo.batch}` : 'batch';
        const folderPath = `smart-mark/${courseInfo.department}/${courseInfo.semester}/${batchFormatted}/${courseInfo.courseCode}/${courseInfo.courseSection}/`;
        console.log('📂 Course folder structure created at:', folderPath);
        toast.success(`Course folders created successfully!\nPath: ${folderPath}\n- Theory folder\n- Lab folder`);
        
      } catch (error) {
        console.error('❌ Error creating course folder structure:', error);
        
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          toast.error(`Failed to create course folders: ${error.message}`);
        } else {
          console.error('Unknown error:', error);
          toast.error('Failed to create course folder structure in Google Drive');
        }
      } finally {
        setIsCreatingFolders(false);
      }
    };

    createCourseStructure();
  }, [auth.isSignedIn, courseInfo, foldersCreated, theoryFolderId, labFolderId, isCreatingFolders, onFoldersCreated]);

  if (!auth.isSignedIn) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.5 2.5l2 2v3l-2-2v-3zm11 0v3l-2 2v-3l2-2zm-6 1l2 2v6l-2-2v-6zm-4.5 6.5l2 2v6l-2-2v-6zm11 0v6l-2-2v-6l2 2zm-7 7l2 2v3l-2-2v-3z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-900">Connect to Google Drive</h3>
              <p className="text-sm text-blue-700 mt-1">
                Automatically organize your OBE files in structured folders
              </p>
              <div className="text-xs text-blue-600 mt-2">
                Will create: Theory folder & Lab folder in your course directory
              </div>
            </div>
          </div>
          <button
            onClick={signIn}
            disabled={auth.isLoading || !courseInfo.courseCode || !courseInfo.courseSection}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {auth.isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </div>
            ) : (
              'Connect Google Drive'
            )}
          </button>
        </div>
        {(!courseInfo.courseCode || !courseInfo.courseSection) && (
          <div className="mt-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
            ⚠️ Please fill in Course Code and Section before connecting to Google Drive
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-10 w-10 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.5 2.5l2 2v3l-2-2v-3zm11 0v3l-2 2v-3l2-2zm-6 1l2 2v6l-2-2v-6zm-4.5 6.5l2 2v6l-2-2v-6zm11 0v6l-2-2v-6l2 2zm-7 7l2 2v3l-2-2v-3z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-green-900">Google Drive Connected</h3>
            <p className="text-sm text-green-700 mt-1">
              Files uploaded through the table will automatically sync to Google Drive
            </p>
            {foldersCreated && (
              <div className="text-sm text-green-600 mt-2 space-y-1">
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Theory folder ready
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Lab folder ready
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={signOut}
          className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {isCreatingFolders && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center text-sm text-blue-600">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating course folder structure...
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Setting up Theory and Lab folders in Google Drive
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveConnection;
