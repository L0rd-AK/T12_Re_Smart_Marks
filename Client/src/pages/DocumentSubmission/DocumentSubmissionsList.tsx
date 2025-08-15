import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGetDocumentSubmissionsQuery, type DocumentSubmissionResponse } from '../../redux/api/documentApi';
import LoadingSpinner from '../../components/LoadingSpinner';

interface UploadedDocument {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  googleDriveId?: string;
  url?: string;
  category: 'theory' | 'lab';
  documentType: string;
  submissionId: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  status: 'yes' | 'no' | 'pending';
}

const DocumentSubmissionsList: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'submissions' | 'documents'>('documents');
  const { data: submissions, isLoading, error } = useGetDocumentSubmissionsQuery();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600">Failed to load document submissions. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract all uploaded documents from all submissions
  const extractAllDocuments = (): UploadedDocument[] => {
    if (!submissions?.data) return [];

    const allDocuments: UploadedDocument[] = [];

    submissions.data.forEach((submission: DocumentSubmissionResponse) => {
      // Process theory documents
      submission.documents.theory.forEach(doc => {
        if (doc.uploadedFiles) {
          Object.entries(doc.uploadedFiles).forEach(([fileType, fileData]) => {
            allDocuments.push({
              id: `${submission._id}-${doc.id}-${fileType}`,
              name: doc.name,
              fileName: fileData.name,
              fileSize: fileData.size,
              fileType: fileData.type,
              uploadDate: doc.submittedAt || submission.updatedAt,
              googleDriveId: fileData.googleDriveId,
              url: fileData.url,
              category: 'theory',
              documentType: fileType,
              submissionId: submission._id,
              courseCode: submission.courseInfo.courseCode,
              courseTitle: submission.courseInfo.courseTitle,
              semester: submission.courseInfo.semester,
              status: doc.status
            });
          });
        }
      });

      // Process lab documents
      submission.documents.lab.forEach(doc => {
        if (doc.uploadedFiles) {
          Object.entries(doc.uploadedFiles).forEach(([fileType, fileData]) => {
            allDocuments.push({
              id: `${submission._id}-${doc.id}-${fileType}`,
              name: doc.name,
              fileName: fileData.name,
              fileSize: fileData.size,
              fileType: fileData.type,
              uploadDate: doc.submittedAt || submission.updatedAt,
              googleDriveId: fileData.googleDriveId,
              url: fileData.url,
              category: 'lab',
              documentType: fileType,
              submissionId: submission._id,
              courseCode: submission.courseInfo.courseCode,
              courseTitle: submission.courseInfo.courseTitle,
              semester: submission.courseInfo.semester,
              status: doc.status
            });
          });
        }
      });
    });

    return allDocuments.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  };

  const allDocuments = extractAllDocuments();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (doc: UploadedDocument) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else if (doc.googleDriveId) {
      window.open(`https://drive.google.com/file/d/${doc.googleDriveId}/view`, '_blank');
    } else {
      console.warn('No download URL available for document:', doc.fileName);
    }
  };

  const renderDocumentsView = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Documents</h3>
              <p className="text-2xl font-bold text-gray-900">{allDocuments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Approved</h3>
              <p className="text-2xl font-bold text-gray-900">{allDocuments.filter(d => d.status === 'yes').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-2xl font-bold text-gray-900">{allDocuments.filter(d => d.status === 'pending').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Size</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatFileSize(allDocuments.reduce((sum, doc) => sum + doc.fileSize, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      {allDocuments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Documents Found</h2>
          <p className="text-gray-500 mb-6">You haven't uploaded any documents yet.</p>
          <button
            onClick={() => navigate('/document-submission')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Uploaded Documents</h3>
            <p className="text-sm text-gray-500">Manage and download your uploaded documents</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doc.fileName}</div>
                          <div className="text-sm text-gray-500">{doc.name}</div>
                          <div className="text-xs text-gray-400">{doc.documentType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{doc.courseCode}</div>
                      <div className="text-sm text-gray-500">{doc.courseTitle}</div>
                      <div className="text-xs text-gray-400">{doc.semester}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        doc.category === 'theory' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {doc.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        doc.status === 'yes' 
                          ? 'bg-green-100 text-green-800'
                          : doc.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doc.status === 'yes' ? 'Approved' : doc.status === 'pending' ? 'Pending' : 'Rejected'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => navigate('/document-submission')}
                        className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderSubmissionsView = () => (
    <div className="space-y-6">
      {!submissions?.data || submissions.data.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Submissions Yet</h2>
          <p className="text-gray-500 mb-6">You haven't created any document submissions yet.</p>
          <button
            onClick={() => navigate('/document-submission')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Submission
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.data.map((submission: DocumentSubmissionResponse) => (
            <div
              key={submission._id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {submission.courseInfo.courseCode} - {submission.courseInfo.courseTitle}
                  </h3>
                  <p className="text-gray-600">
                    {submission.courseInfo.semester} | Section: {submission.courseInfo.courseSection}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    submission.overallStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : submission.overallStatus === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission.overallStatus.charAt(0).toUpperCase() + submission.overallStatus.slice(1)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(submission.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Documents Summary</h4>
                  <div className="flex space-x-4 text-sm">
                    <div>
                      <span className="font-medium">Theory:</span>
                      <span className="ml-1 text-green-600">
                        {submission.documents.theory.filter((doc: { status: string }) => doc.status === 'yes').length}
                      </span>
                      <span className="text-gray-500">
                        /{submission.documents.theory.length}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Lab:</span>
                      <span className="ml-1 text-green-600">
                        {submission.documents.lab.filter((doc: { status: string }) => doc.status === 'yes').length}
                      </span>
                      <span className="text-gray-500">
                        /{submission.documents.lab.length}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Completion</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${submission.completionPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{submission.completionPercentage}% Complete</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 ">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Document Management
                </h1>
                <p className="text-gray-600 mt-1">View and manage all your uploaded documents</p>
              </div>
              <button
                onClick={() => navigate('/document-submission')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Submission
              </button>
            </div>
            
            {/* View Toggle */}
            <div className="mt-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setViewMode('documents')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      viewMode === 'documents'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    All Documents ({allDocuments.length})
                  </button>
                  <button
                    onClick={() => setViewMode('submissions')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      viewMode === 'submissions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Submissions ({submissions?.data?.length || 0})
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {viewMode === 'documents' ? renderDocumentsView() : renderSubmissionsView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSubmissionsList;