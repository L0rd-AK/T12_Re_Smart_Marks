import React, { useState, useEffect, useCallback } from 'react';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { toast } from 'sonner';
import type { GoogleDriveFile } from '../services/googleDriveService';
import { GoogleDriveService } from '../services/googleDriveService';

interface CourseInfo {
  courseCode: string;
  courseSection: string;
  batch?: string;
}

interface GoogleDriveIntegrationProps {
  onFileUploaded?: (file: GoogleDriveFile, fileType: string) => void;
  documentName: string;
  fileTypes: string[];
  category: 'theory' | 'lab' | 'general';
  courseInfo?: CourseInfo;
}

const GoogleDriveIntegration: React.FC<GoogleDriveIntegrationProps> = ({
  onFileUploaded,
  documentName,
  fileTypes,
  category,
  courseInfo
}) => {
  const {
    auth,
    signIn,
    signOut,
    uploadFile,
    createFolder,
    listFiles,
    deleteFile,
    uploadProgress
  } = useGoogleDrive();

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, GoogleDriveFile>>({});
  const [courseFolderId, setCourseFolderId] = useState<string | null>(null);
  const [categoryFolderId, setCategoryFolderId] = useState<string | null>(null);
  const [isCreatingFolders, setIsCreatingFolders] = useState(false);
  const [showDriveFiles, setShowDriveFiles] = useState(false);

  // Create structured folder path when user signs in and course info is available
  useEffect(() => {
    const setupCourseFolder = async () => {
      if (!auth.isSignedIn) {
        console.log('❌ User not signed in to Google Drive');
        return;
      }

      if (!courseInfo) {
        console.log('❌ No course info provided');
        return;
      }

      if (!courseInfo.courseCode || !courseInfo.courseSection) {
        console.log('❌ Missing required course info:', { courseCode: courseInfo.courseCode, courseSection: courseInfo.courseSection });
        toast.error('Please enter Course Code and Section before connecting to Google Drive');
        return;
      }

      if (courseFolderId && categoryFolderId) {
        console.log('✅ Course and category folders already exist:', { courseFolderId, categoryFolderId });
        return;
      }

      if (isCreatingFolders) {
        console.log('⏳ Already creating folders...');
        return;
      }

      console.log('🚀 Starting course folder creation...', courseInfo);
      setIsCreatingFolders(true);

      try {
        // Create structured folder path: smart-mark/cse/cse-321/batch-61/section-s
        console.log('📁 Creating course folder structure...');
        const baseFolderId = await GoogleDriveService.createCourseFolder({
          courseCode: courseInfo.courseCode,
          courseSection: courseInfo.courseSection,
          batch: courseInfo.batch || '61'
        });

        console.log('✅ Course folder created successfully:', baseFolderId);
        setCourseFolderId(baseFolderId);

        // Create category-specific folder (Theory/Lab)
        console.log(`📂 Creating ${category} folder...`);
        const catFolderId = await GoogleDriveService.createCategoryFolder(baseFolderId, category);

        console.log(`✅ ${category} folder created successfully:`, catFolderId);
        setCategoryFolderId(catFolderId);

        const folderPath = `smart-mark/${courseInfo.courseCode.split('-')[0]?.toLowerCase() || courseInfo.courseCode.toLowerCase()}/${courseInfo.courseCode.toLowerCase().replace(/\s+/g, '-')}/batch-${courseInfo.batch || '61'}/section-${courseInfo.courseSection.toLowerCase()}/${category === 'theory' ? 'Theory' : 'Lab'}`;
        toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} folder created: ${folderPath}`);
      } catch (error) {
        console.error('❌ Error creating course folder structure:', error);

        // More detailed error handling
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
          toast.error(`Failed to create course folder: ${error.message}`);
        } else {
          console.error('Unknown error:', error);
          toast.error('Failed to create course folder structure in Google Drive');
        }
      } finally {
        setIsCreatingFolders(false);
      }
    };

    setupCourseFolder();
  }, [auth.isSignedIn, courseInfo, courseFolderId, categoryFolderId, isCreatingFolders, category]);

  const handleFileUpload = async (file: File, fileType: string) => {
    if (!categoryFolderId) {
      toast.error('Course folder not ready. Please wait...');
      return;
    }

    const fileName = `${fileType}_${file.name}`;
    const uploadedFile = await uploadFile(file, fileName, categoryFolderId);

    if (uploadedFile) {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: uploadedFile
      }));

      onFileUploaded?.(uploadedFile, fileType);
    }
  };

  const handleDeleteFile = async (fileType: string) => {
    const file = uploadedFiles[fileType];
    if (!file) return;

    const success = await deleteFile(file.id);
    if (success) {
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[fileType];
        return newFiles;
      });
    }
  };

  const loadExistingFiles = useCallback(async () => {
    if (!categoryFolderId) return;

    try {
      const files = await listFiles(categoryFolderId);
      const fileMap: Record<string, GoogleDriveFile> = {};

      files.forEach((file: GoogleDriveFile) => {
        fileTypes.forEach(fileType => {
          if (file.name.startsWith(`${fileType}_`)) {
            fileMap[fileType] = file;
          }
        });
      });

      setUploadedFiles(fileMap);
    } catch (error) {
      console.error('Error loading existing files:', error);
    }
  }, [categoryFolderId, listFiles, fileTypes]);

  // Load existing files when folder is ready
  useEffect(() => {
    if (categoryFolderId && auth.isSignedIn) {
      loadExistingFiles();
    }
  }, [categoryFolderId, auth.isSignedIn, loadExistingFiles]);

  const getFileTypeDisplayName = (fileType: string): string => {
    const displayNames: Record<string, string> = {
      'marginal': 'Marginal Script',
      'average': 'Average Script',
      'excellent': 'Excellent Script',
      'question': 'Question Paper',
      'doc': 'Document (.doc)',
      'class-attendance': 'Class Attendance',
      'midterm-attendance': 'Midterm Attendance',
      'final-attendance': 'Final Attendance',
      'assignment-marks': 'Assignment Marks',
      'presentation-marks': 'Presentation Marks',
      'tabulation': 'Tabulation Sheet',
      'co-po-mapping': 'CO-PO Mapping',
      'course-end-report': 'Course End Report',
      'lab-report': 'Lab Report',
      'lab-performance': 'Lab Performance',
      'lab-final': 'Lab Final',
      'project': 'Project',
      'projects-list': 'Projects List',
      'experiments-list': 'Experiments List',
      'attendance': 'Attendance'
    };
    return displayNames[fileType] || fileType.charAt(0).toUpperCase() + fileType.slice(1);
  };

  if (!auth.isSignedIn) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.5 2.5l2 2v3l-2-2v-3zm11 0v3l-2 2v-3l2-2zm-6 1l2 2v6l-2-2v-6zm-4.5 6.5l2 2v6l-2-2v-6zm11 0v6l-2-2v-6l2 2zm-7 7l2 2v3l-2-2v-3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-blue-900">Connect to Google Drive</h3>
              <p className="text-sm text-blue-700">
                Upload and manage your documents directly in your personal Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={signIn}
            disabled={auth.isLoading}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {auth.isLoading ? 'Connecting...' : 'Connect Google Drive'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.5 2.5l2 2v3l-2-2v-3zm11 0v3l-2 2v-3l2-2zm-6 1l2 2v6l-2-2v-6zm-4.5 6.5l2 2v6l-2-2v-6zm11 0v6l-2-2v-6l2 2zm-7 7l2 2v3l-2-2v-3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-green-900">Google Drive Connected</h3>
            <p className="text-sm text-green-700">
              {fileTypes.length > 0
                ? "Files will be uploaded to your Google Drive folder"
                : "Files uploaded through the table will automatically sync to Google Drive"
              }
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDriveFiles(!showDriveFiles)}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            {showDriveFiles ? 'Hide Files' : 'View Files'}
          </button>
          <button
            onClick={signOut}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Uploading to Google Drive...</span>
            <span>{uploadProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* File Upload Inputs - Only show if fileTypes has content */}
      {fileTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {fileTypes.map((fileType) => (
            <div key={fileType} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {getFileTypeDisplayName(fileType)}
              </label>

              {uploadedFiles[fileType] ? (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-green-100 border border-green-300 rounded px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-green-700 truncate">
                        {uploadedFiles[fileType].name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(fileType)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, fileType);
                    }
                  }}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  disabled={!categoryFolderId || isCreatingFolders}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Files in Drive */}
      {showDriveFiles && (
        <div className="mt-4 border-t border-green-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Files in Google Drive:</h4>
          {Object.keys(uploadedFiles).length === 0 ? (
            <p className="text-sm text-gray-500">No files uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(uploadedFiles).map(([fileType, file]) => (
                <div key={fileType} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div>
                    <span className="text-sm font-medium">{getFileTypeDisplayName(fileType)}</span>
                    <span className="text-xs text-gray-500 ml-2">{file.name}</span>
                  </div>
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View in Drive
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(isCreatingFolders || !categoryFolderId) && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center text-sm text-blue-600">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Setting up course folder structure...
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveIntegration;
