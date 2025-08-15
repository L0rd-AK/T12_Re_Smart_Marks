import React from 'react';
import { SharedDriveService } from '../services/sharedDriveService';

interface SharedDriveStatusProps {
  isConnected: boolean;
  uploadResults?: {
    personal: boolean;
    shared: boolean;
    errors: string[];
  }[];
}

const SharedDriveStatus: React.FC<SharedDriveStatusProps> = ({ 
  isConnected, 
  uploadResults = [] 
}) => {
  const sharedDriveUrl = SharedDriveService.getSharedDriveUrl();
  const sharedDriveInfo = SharedDriveService.getSharedDriveInfo();

  const totalUploads = uploadResults.length;
  const successfulSharedUploads = uploadResults.filter(result => result.shared).length;
  const successfulPersonalUploads = uploadResults.filter(result => result.personal).length;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 my-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-medium text-blue-900">
              Dual Drive Upload System
            </h4>
            <p className="text-sm text-blue-700">
              Files are uploaded to both your personal drive and the shared institutional drive
            </p>
          </div>
        </div>
        
        {isConnected ? (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Connected
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⚠ Not Connected
            </span>
          </div>
        )}
      </div>

      {/* Shared Drive Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <h5 className="font-medium text-gray-900 mb-1">Personal Drive</h5>
          <p className="text-sm text-gray-600">
            Files saved to your personal Google Drive folders
          </p>
          {totalUploads > 0 && (
            <div className="mt-2">
              <span className="text-xs font-medium text-green-600">
                {successfulPersonalUploads}/{totalUploads} uploads successful
              </span>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <h5 className="font-medium text-gray-900 mb-1">Shared Institutional Drive</h5>
          <p className="text-sm text-gray-600">
            Files also saved to the shared {sharedDriveInfo.sharedDriveName}
          </p>
          {totalUploads > 0 && (
            <div className="mt-2">
              <span className="text-xs font-medium text-green-600">
                {successfulSharedUploads}/{totalUploads} uploads successful
              </span>
            </div>
          )}
          <a 
            href={sharedDriveUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            View Shared Drive
          </a>
        </div>
      </div>

      {/* Upload Status */}
      {totalUploads > 0 && (
        <div className="border-t border-blue-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Upload Status</span>
            <div className="flex space-x-4">
              <span className="text-xs text-gray-500">
                Personal: {successfulPersonalUploads}/{totalUploads}
              </span>
              <span className="text-xs text-gray-500">
                Shared: {successfulSharedUploads}/{totalUploads}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalUploads > 0 ? (successfulPersonalUploads / totalUploads) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">Personal Drive</span>
            </div>
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalUploads > 0 ? (successfulSharedUploads / totalUploads) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">Shared Drive</span>
            </div>
          </div>
        </div>
      )}

      {/* Connection Instructions */}
      {!isConnected && (
        <div className="border-t border-blue-200 pt-3">
          <p className="text-sm text-gray-600">
            Connect to Google Drive to enable dual upload functionality. Files will be saved to both your personal drive and the institutional shared drive.
          </p>
        </div>
      )}
    </div>
  );
};

export default SharedDriveStatus;
