import React, { useState } from 'react';
import {
  useGetCourseRequestsQuery,
  useUpdateCourseRequestStatusMutation,
  useGetDocumentSubmissionRequestsQuery,
  useUpdateDocumentSubmissionStatusMutation,
} from '../../../redux/api/teacherRequestsApi';

const TeacherRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'course' | 'documents'>('course');
  
  // API hooks
  const { data: courseRequestsData, isLoading: courseRequestsLoading } = useGetCourseRequestsQuery();
  const { data: documentSubmissionsData, isLoading: documentSubmissionsLoading } = useGetDocumentSubmissionRequestsQuery();
  const [updateCourseRequestStatus] = useUpdateCourseRequestStatusMutation();
  const [updateDocumentSubmissionStatus] = useUpdateDocumentSubmissionStatusMutation();

  // Extract data from API responses
  const courseRequests = courseRequestsData?.data || [];
  const documentSubmissions = documentSubmissionsData?.data || [];

  const handleCourseRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await updateCourseRequestStatus({
        requestId,
        status: action === 'approve' ? 'approved' : 'rejected',
      }).unwrap();
    } catch (error) {
      console.error('Error updating course request status:', error);
    }
  };

  const handleDocumentRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await updateDocumentSubmissionStatus({
        submissionId: requestId,
        status: action === 'approve' ? 'approved' : 'rejected',
      }).unwrap();
    } catch (error) {
      console.error('Error updating document submission status:', error);
    }
  };

  const getStatusBadge = (status: string, type: 'course' | 'documents') => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    
    if (type === 'course') {
      switch (status) {
        case 'pending':
          return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
        case 'approved':
          return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
        case 'rejected':
          return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
        default:
          return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
      }
    } else {
      switch (status) {
        case 'pending':
          return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
        case 'approved':
          return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>;
        case 'rejected':
          return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>;
        case 'in-review':
          return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>In Review</span>;
        default:
          return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
      }
    }
  };

  const getCompletionBar = (percentage: number) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Requests & Submissions</h2>
        <p className="text-gray-600">Manage teacher course requests and review document submissions</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('course')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'course'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
                         >
               Course Requests ({courseRequests.filter(r => r.status === 'pending').length})
             </button>
             <button
               onClick={() => setActiveTab('documents')}
               className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                 activeTab === 'documents'
                   ? 'border-blue-500 text-blue-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
             >
               Document Submissions ({documentSubmissions.filter(r => r.overallStatus === 'pending' || r.overallStatus === 'in-review').length})
             </button>
          </nav>
        </div>
      </div>

      {/* Course Requests Tab */}
      {activeTab === 'course' && (
        <div className="space-y-4">
          {courseRequestsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Course Assignment Requests</h3>
                <div className="text-sm text-gray-500">
                  {courseRequests.filter(r => r.status === 'pending').length} pending requests
                </div>
              </div>
          
                      <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {courseRequests.map((request) => (
                <li key={request._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {request.teacherName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.employeeId} • {request.teacherEmail}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(request.status, 'course')}
                          <span className="text-xs text-gray-400">
                            {new Date(request.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">
                          {request.courseCode} - {request.courseTitle}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.semester} • {request.batch} • {request.department}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>
                      </div>

                      {request.reviewComments && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Review Comment:</span> {request.reviewComments}
                          </p>
                        </div>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => handleCourseRequestAction(request._id, 'approve')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleCourseRequestAction(request._id, 'reject')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
            </>
          )}
        </div>
      )}

      {/* Document Submissions Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {documentSubmissionsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Document Submission Requests</h3>
                                 <div className="text-sm text-gray-500">
                   {documentSubmissions.filter(r => r.overallStatus === 'pending' || r.overallStatus === 'in-review').length} pending reviews
                 </div>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                 <ul className="divide-y divide-gray-200">
                   {documentSubmissions.map((request) => (
                <li key={request._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {request.teacherName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.employeeId} • {request.teacherEmail}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(request.overallStatus, 'documents')}
                          <span className="text-xs text-gray-400">
                            {request.submittedAt 
                              ? new Date(request.submittedAt).toLocaleDateString()
                              : 'Not submitted'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">
                          {request.courseCode} - {request.courseTitle}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.semester} • {request.batch} • {request.department}
                        </p>
                        
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>Completion: {request.completionPercentage}%</span>
                            <span className="text-xs">{request.submissionStatus}</span>
                          </div>
                          {getCompletionBar(request.completionPercentage)}
                        </div>

                        {request.reviewComments && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Review Comment:</span> {request.reviewComments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {(request.overallStatus === 'pending' || request.overallStatus === 'in-review') && (
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => handleDocumentRequestAction(request._id, 'approve')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDocumentRequestAction(request._id, 'reject')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherRequests; 