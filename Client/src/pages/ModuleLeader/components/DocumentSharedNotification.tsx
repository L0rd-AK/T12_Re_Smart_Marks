import React from 'react';
import { Check, ExternalLink, Download } from 'lucide-react';
import { type DocumentDistribution } from '../../../redux/api/documentDistributionApi';

interface DocumentSharedNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName: string;
  sharedDocuments: DocumentDistribution[];
}

const DocumentSharedNotification: React.FC<DocumentSharedNotificationProps> = ({
  isOpen,
  onClose,
  teacherName,
  sharedDocuments
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Documents Successfully Shared
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {sharedDocuments.length} document(s) shared with {teacherName}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {sharedDocuments.map((document) => (
              <div
                key={document.distributionId}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {document.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {document.course.courseCode} - {document.course.courseName}
                    </p>
                    {document.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{document.fileCount} files</span>
                      <span className="capitalize">{document.category.replace('-', ' ')}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        document.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        document.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        document.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {document.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Files Preview */}
                {document.files.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700 mb-2">Files:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {document.files.slice(0, 4).map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                        >
                          <span className="truncate font-medium text-gray-900">
                            {file.originalName}
                          </span>
                          <div className="flex gap-1 ml-2">
                            <a
                              href={file.liveViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              title="View file"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                              href={file.downloadLink}
                              download
                              className="text-green-600 hover:text-green-800"
                              title="Download file"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                      {document.files.length > 4 && (
                        <div className="text-xs text-gray-500 text-center py-2">
                          +{document.files.length - 4} more files
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• {teacherName} can now access these documents through live view links</li>
              <li>• The teacher has download permissions for all shared files</li>
              <li>• Access is tracked and logged for audit purposes</li>
              <li>• The teacher request has been automatically approved</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentSharedNotification;
