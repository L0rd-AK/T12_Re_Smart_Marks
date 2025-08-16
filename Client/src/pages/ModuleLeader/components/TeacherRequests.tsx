import React, { useState } from 'react';
import {
  useGetPendingRequestsQuery,
  useRespondToRequestMutation,
} from '../../../redux/api/courseAccessApi';
import {
  useGetCourseDocumentDistributionsQuery,
} from '../../../redux/api/documentDistributionApi';
import { type CourseAccessRequest } from '../../../redux/api/courseAccessApi';
import { toast } from 'sonner';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { Check, X, Clock, ExternalLink, BookOpen } from 'lucide-react';

const TeacherRequests: React.FC = () => {
  // API hooks
  const { data: pendingRequestsData, isLoading: pendingRequestsLoading } = useGetPendingRequestsQuery();
  const [respondToRequest, { isLoading: isResponding }] = useRespondToRequestMutation();

  // State for document selection
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CourseAccessRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Document distribution API for the selected request
  const { data: courseDocumentsData, isLoading: courseDocumentsLoading } = useGetCourseDocumentDistributionsQuery(
    selectedRequest?.course._id || '',
    { skip: !selectedRequest }
  );

  // Extract data from API responses
  const pendingRequests = pendingRequestsData?.data || [];
  const courseDocuments = courseDocumentsData?.data || [];

  const handleRespondToRequest = (request: CourseAccessRequest) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  const submitResponse = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    try {
      await respondToRequest({
        requestId: selectedRequest._id,
        data: {
          status,
          responseMessage: responseMessage,
          selectedDocuments: status === 'approved' ? selectedDocuments : undefined
        }
      }).unwrap();

      setShowResponseModal(false);
      setResponseMessage("");
      setSelectedRequest(null);
      setSelectedDocuments([]);

      // Show success message
      toast.success(`Request ${status} successfully!`);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error.data as { message?: string })?.message || 'Failed to respond to request'
        : 'Failed to respond to request';
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="badge bg-green-100 text-green-800 border border-green-200">Approved</span>;
      case "rejected":
        return <span className="badge bg-red-100 text-red-800 border border-red-200">Rejected</span>;
      default:
        return <span className="badge bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>;
    }
  };



    return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Course Requests</h2>
        <p className="text-gray-600">Manage teacher course access requests</p>
      </div>

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
                          {getStatusBadge(request.status)}
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
                          onClick={() => handleApproveWithDocuments(request)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Approve & Share Docs
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

      {/* Document Selection Modal */}
      <DocumentSelectionModal
        isOpen={showDocumentModal}
        onClose={() => {
          setShowDocumentModal(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleDocumentSelection}
        teacherName={selectedRequest?.teacherName || ''}
        courseCode={selectedRequest?.courseCode || ''}
        loading={isSharing}
      />

      {/* Success Notification */}
      <DocumentSharedNotification
        isOpen={showSuccessNotification}
        onClose={() => {
          setShowSuccessNotification(false);
          setSharedDocuments([]);
        }}
        teacherName={selectedRequest?.teacherName || ''}
        sharedDocuments={sharedDocuments}
      />
    </div>
  );
};

export default TeacherRequests; 