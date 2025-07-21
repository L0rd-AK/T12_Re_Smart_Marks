import React from 'react';

const GoogleDriveSetupInstructions: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.5 2.5l2 2v3l-2-2v-3zm11 0v3l-2 2v-3l2-2zm-6 1l2 2v6l-2-2v-6zm-4.5 6.5l2 2v6l-2-2v-6zm11 0v6l-2-2v-6l2 2zm-7 7l2 2v3l-2-2v-3z"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Google Drive Integration
          </h3>
          <p className="text-blue-700 mb-4">
            Connect your Google Drive to automatically organize and store your OBE documents in a structured folder system.
          </p>
          
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5">1</span>
              <div>
                <strong>Automatic Folder Creation:</strong> The system will create organized folders in your Google Drive:
                <ul className="ml-4 mt-1 list-disc list-inside text-blue-700">
                  <li>Smart Marks - OBE Documents</li>
                  <li>Theory Documents / Lab Documents</li>
                  <li>Individual document folders for each submission</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5">2</span>
              <div>
                <strong>Secure Access:</strong> Only files you upload through this application will be accessible. Your other Drive files remain private.
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5">3</span>
              <div>
                <strong>Progress Tracking:</strong> Real-time upload progress and automatic file organization by document type.
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5">4</span>
              <div>
                <strong>Dual Upload Options:</strong> Choose between Google Drive integration or traditional local file uploads for maximum flexibility.
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-200">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-800">Note:</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Your Google account will only be used for file storage. No personal data is accessed beyond what's necessary for file management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveSetupInstructions;
