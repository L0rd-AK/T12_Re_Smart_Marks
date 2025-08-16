import React, { useState } from 'react';
import {
  useGetCourseRequestsQuery,
  useUpdateCourseRequestStatusMutation,
  useShareDocumentsWithTeacherMutation,
} from '../../../redux/api/teacherRequestsApi';
import { type DocumentDistribution } from '../../../redux/api/documentDistributionApi';
import DocumentSelectionModal from './DocumentSelectionModal';
import DocumentSharedNotification from './DocumentSharedNotification';
import { toast } from 'react-hot-toast';

const TeacherRequests: React.FC = () => {
  // API hooks
  const { data: courseRequestsData, isLoading: courseRequestsLoading } = useGetCourseRequestsQuery();
  const [updateCourseRequestStatus] = useUpdateCourseRequestStatusMutation();
  const [shareDocumentsWithTeacher] = useShareDocumentsWithTeacherMutation();

  // Modal state
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<{ _id: string; teacherName: string; courseCode: string; employeeId: string } | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Extract data from API responses
  const courseRequests = courseRequestsData?.data || [];

  const handleApproveWithDocuments = (request: {
    _id: string;
    teacherName: string;
    courseCode: string;
    employeeId: string;
  }) => {
    setSelectedRequest({
      _id: request._id,
      teacherName: request.teacherName,
      courseCode: request.courseCode,
      employeeId: request.employeeId
    });
    setShowDocumentModal(true);
  };

  const handleDocumentSelection = async (selectedDocuments: DocumentDistribution[]) => {
    if (!selectedRequest) return;

    setIsSharing(true);
    try {
      // Share documents with teacher
      await shareDocumentsWithTeacher({
        requestId: selectedRequest._id,
        teacherId: selectedRequest.employeeId,
        documentDistributionIds: selectedDocuments.map(doc => doc.distributionId),
        accessType: 'download'
      }).unwrap();

      // Update course request status to approved
      await updateCourseRequestStatus({
        requestId: selectedRequest._id,
        status: 'approved',
      }).unwrap();

      toast.success(`Request approved and ${selectedDocuments.length} document(s) shared with ${selectedRequest.teacherName}`);
      setShowDocumentModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error sharing documents:', error);
      toast.error('Failed to share documents and approve request');
    } finally {
      setIsSharing(false);
    }
  };

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

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    
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
    </div>
  );
};

export default TeacherRequests; 