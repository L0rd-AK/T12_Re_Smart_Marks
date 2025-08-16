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
import { Check, X } from 'lucide-react';

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
          {pendingRequestsLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Course Assignment Requests</h3>
                <div className="text-sm text-gray-500">
                  {pendingRequests.filter(r => r.status === 'pending').length} pending requests
                </div>
              </div>
          
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {pendingRequests.map((request) => (
                  <li key={request._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {request.teacher.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.teacher.employeeId} • {request.teacher.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(request.status)}
                            <span className="text-xs text-gray-400">
                              {new Date(request.requestDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900">
                            {request.course.code} - {request.course.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.semester} • {request.batch} • {request.course.department.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Message:</span> {request.message}
                          </p>
                        </div>

                        {request.responseMessage && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Response:</span> {request.responseMessage}
                            </p>
                          </div>
                        )}
                      </div>

                      {request.status === 'pending' && (
                        <div className="ml-4 flex space-x-2">
                          <button
                            onClick={() => handleRespondToRequest(request)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve & Share Docs
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              submitResponse('rejected');
                            }}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <X className="w-3 h-3 mr-1" />
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

        {/* Response Modal */}
        {showResponseModal && selectedRequest && (
          <div className="modal modal-open">
            <div className="modal-box bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-2xl">
              <h3 className="font-bold text-xl text-gray-900">Respond to Request</h3>
              <p className="text-gray-700 mb-4">
                Request from <span className="font-medium">{selectedRequest.teacher.name}</span> for {selectedRequest.course.code}
              </p>

              <div className="space-y-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedRequest.message}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="responseMessage" className="text-sm font-medium text-gray-700 block">
                    Response Message (Optional)
                  </label>
                  <textarea
                    id="responseMessage"
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Add a message for the teacher..."
                    className="textarea textarea-bordered w-full min-h-[80px] focus:border-indigo-500 focus:ring-indigo-500 bg-white text-black drop-shadow-sm"
                  ></textarea>
                </div>

                {/* Document Selection Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Select Documents to Share (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Choose which documents to share with the teacher when approving their request
                  </p>
                  
                  {courseDocumentsLoading ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : courseDocuments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No documents available for this course</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {courseDocuments.map((document, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            id={`doc-${idx}`}
                            checked={selectedDocuments.includes(document.distributionId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocuments([...selectedDocuments, document.distributionId])
                              } else {
                                setSelectedDocuments(selectedDocuments.filter(id => id !== document.distributionId))
                              }
                            }}
                            className="checkbox checkbox-primary"
                          />
                          <label htmlFor={`doc-${idx}`} className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium text-gray-900">{document.title}</p>
                              <p className="text-sm text-gray-600">{document.category} • {document.fileCount} file(s)</p>
                              <p className="text-xs text-gray-500">{document.description}</p>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowResponseModal(false)
                    setSelectedDocuments([])
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn bg-red-600 hover:bg-red-700 text-white border-none"
                  disabled={isResponding}
                  onClick={() => submitResponse('rejected')}
                >
                  {isResponding ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  )}
                </button>
                <button
                  className="btn bg-green-600 hover:bg-green-700 text-white border-none"
                  disabled={isResponding}
                  onClick={() => submitResponse('approved')}
                >
                  {isResponding ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};

export default TeacherRequests; 