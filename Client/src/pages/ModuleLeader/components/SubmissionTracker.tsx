import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useGetAllSubmissionsForReviewQuery, useUpdateSubmissionReviewStatusMutation, DocumentSubmissionResponse } from '../../../redux/api/documentApi';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface DocumentDetail {
  id: string;
  name: string;
  category: 'theory' | 'lab';
  fileTypes: string[];
  status: 'yes' | 'no' | 'pending';
  submittedAt?: string;
  uploadedFiles?: Record<string, {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  }>;
}

interface ProcessedSubmission {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  employeeId: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  batch: string;
  department: string;
  courseSection: string;
  submissionStatus: 'draft' | 'partial' | 'complete' | 'submitted';
  overallStatus: 'pending' | 'approved' | 'rejected' | 'in-review';
  completionPercentage: number;
  submittedAt?: string;
  lastModifiedAt: string;
  reviewComments?: string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  totalDocuments: number;
  submittedDocuments: number;
  theoryDocuments: DocumentDetail[];
  labDocuments: DocumentDetail[];
}

interface SubmissionStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

const SubmissionTracker: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ProcessedSubmission | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // API Queries
  const { 
    data: submissionsData, 
    isLoading, 
    error,
    refetch 
  } = useGetAllSubmissionsForReviewQuery({
    status: filterStatus === 'all' ? undefined : filterStatus,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [updateSubmissionReviewStatus] = useUpdateSubmissionReviewStatusMutation();

  // Process the API data to match our component structure
  const processSubmissions = (data: DocumentSubmissionResponse[]): ProcessedSubmission[] => {
    return data.map(submission => {
      const theoryDocs = submission.documents.theory || [];
      const labDocs = submission.documents.lab || [];
      const allDocs = [...theoryDocs, ...labDocs];
      const submittedDocs = allDocs.filter(doc => doc.status === 'yes');

      return {
        id: submission._id,
        teacherId: submission._id, // Using submission ID as teacher ID for now
        teacherName: submission.teacherInfo.teacherName,
        teacherEmail: submission.teacherInfo.emailId,
        employeeId: submission.teacherInfo.employeeId,
        courseCode: submission.courseInfo.courseCode,
        courseTitle: submission.courseInfo.courseTitle,
        semester: submission.courseInfo.semester,
        batch: submission.courseInfo.batch,
        department: submission.courseInfo.department,
        courseSection: submission.courseInfo.courseSection,
        submissionStatus: submission.submissionStatus,
        overallStatus: submission.overallStatus,
        completionPercentage: submission.completionPercentage,
        submittedAt: submission.submittedAt,
        lastModifiedAt: submission.lastModifiedAt,
        reviewComments: submission.reviewComments,
        reviewedBy: submission.reviewedBy,
        reviewedAt: submission.reviewedAt,
        totalDocuments: allDocs.length,
        submittedDocuments: submittedDocs.length,
        theoryDocuments: theoryDocs,
        labDocuments: labDocs,
      };
    });
  };

  const submissions = submissionsData?.data ? processSubmissions(submissionsData.data) : [];

  // Calculate statistics
  const stats: SubmissionStats = {
    total: submissions.length,
    completed: submissions.filter(s => s.submissionStatus === 'submitted' && s.overallStatus === 'approved').length,
    pending: submissions.filter(s => s.overallStatus === 'pending' || s.overallStatus === 'in-review').length,
    overdue: submissions.filter(s => {
      if (s.overallStatus !== 'pending') return false;
      // For now, we'll consider submissions without a deadline as not overdue
      // You can implement actual deadline logic here
      return false;
    }).length,
  };

  // Filter submissions based on selected filters
  const filteredSubmissions = submissions.filter(submission => {
    const statusMatch = filterStatus === 'all' || submission.overallStatus === filterStatus;
    const departmentMatch = filterDepartment === 'all' || submission.department.includes(filterDepartment);
    const courseMatch = filterCourse === 'all' || submission.courseCode.toLowerCase().includes(filterCourse.toLowerCase());
    return statusMatch && departmentMatch && courseMatch;
  });

  // Get unique departments and courses for filter options
  const departments = [...new Set(submissions.map(s => s.department))];
  const courses = [...new Set(submissions.map(s => s.courseCode))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-review': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'complete': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = async (submissionId: string, newStatus: 'pending' | 'approved' | 'rejected' | 'in-review', comments?: string) => {
    try {
      await updateSubmissionReviewStatus({
        id: submissionId,
        overallStatus: newStatus,
        reviewComments: comments,
      }).unwrap();
      
      toast.success(`Submission status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      console.error('Error updating submission status:', error);
      toast.error('Failed to update submission status');
    }
  };

  const sendReminder = () => {
    const pendingSubmissions = submissions.filter(s => s.overallStatus === 'pending');
    if (pendingSubmissions.length === 0) {
      toast('No pending submissions to remind', { icon: '📝' });
      return;
    }
    
    // Simulate sending reminders
    toast.success(`Reminders sent to ${pendingSubmissions.length} teachers`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalFileSize = (documents: DocumentDetail[]) => {
    let totalSize = 0;
    documents.forEach(doc => {
      if (doc.uploadedFiles) {
        Object.values(doc.uploadedFiles).forEach(file => {
          totalSize += file.size;
        });
      }
    });
    return totalSize;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Submissions</h3>
          <p className="text-red-600 text-sm mt-1">
            Failed to load document submissions. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-red-800 hover:text-red-900 text-sm underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submission Tracker</h2>
          <p className="text-gray-600 mt-1">Track and verify timely submission of required documents</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={sendReminder}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Send Reminders
          </button>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{submissions.length}</div>
          <div className="text-blue-100">Total Submissions</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{submissions.filter(s => s.submissionStatus === 'submitted' && s.overallStatus === 'approved').length}</div>
          <div className="text-green-100">Approved</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{submissions.filter(s => s.overallStatus === 'pending' || s.overallStatus === 'in-review').length}</div>
          <div className="text-yellow-100">Pending Review</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{submissions.filter(s => s.submissionStatus === 'submitted').length}</div>
          <div className="text-purple-100">Submitted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by review status"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by department"
        >
          <option value="all">All Departments</option>
          {[...new Set(submissions.map(s => s.department))].map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by course"
        >
          <option value="all">All Courses</option>
          {[...new Set(submissions.map(s => s.courseCode))].map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher & Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department & Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{submission.teacherName}</div>
                      <div className="text-sm text-gray-500">{submission.teacherEmail}</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">
                        {submission.courseCode} - {submission.courseTitle}
                      </div>
                      <div className="text-xs text-gray-500">Employee ID: {submission.employeeId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.department}</div>
                    <div className="text-sm text-gray-500">Section: {submission.courseSection}</div>
                    <div className="text-sm text-gray-500">Batch: {submission.batch}</div>
                    <div className="text-sm text-gray-500">Semester: {submission.semester}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {submission.submittedDocuments}/{submission.totalDocuments} documents
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${submission.completionPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{submission.completionPercentage}% Complete</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubmissionStatusColor(submission.submissionStatus)}`}>
                      {submission.submissionStatus}
                    </span>
                    {submission.submittedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.overallStatus)}`}>
                      {submission.overallStatus}
                    </span>
                    {submission.reviewedBy && (
                      <div className="text-xs text-gray-500 mt-1">
                        By: {submission.reviewedBy.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(submission.lastModifiedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                    {submission.submissionStatus === 'submitted' && submission.overallStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(submission.id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(submission.id, 'rejected', 'Needs revision')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {submission.overallStatus === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(submission.id, 'in-review')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSubmissions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No submissions found matching the current filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {submissionsData?.pagination && submissionsData.pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: submissionsData.pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto text-black">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Document Submission Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Teacher and Course Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Teacher Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedSubmission.teacherName}</div>
                    <div><span className="font-medium">Email:</span> {selectedSubmission.teacherEmail}</div>
                    <div><span className="font-medium">Employee ID:</span> {selectedSubmission.employeeId}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Course Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Course:</span> {selectedSubmission.courseCode} - {selectedSubmission.courseTitle}</div>
                    <div><span className="font-medium">Section:</span> {selectedSubmission.courseSection}</div>
                    <div><span className="font-medium">Department:</span> {selectedSubmission.department}</div>
                    <div><span className="font-medium">Batch:</span> {selectedSubmission.batch}</div>
                    <div><span className="font-medium">Semester:</span> {selectedSubmission.semester}</div>
                  </div>
                </div>
              </div>

              {/* Submission Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Submission Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Submission Status:</span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubmissionStatusColor(selectedSubmission.submissionStatus)}`}>
                      {selectedSubmission.submissionStatus}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Review Status:</span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.overallStatus)}`}>
                      {selectedSubmission.overallStatus}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Completion:</span>
                    <span className="ml-2 font-medium">{selectedSubmission.completionPercentage}%</span>
                  </div>
                </div>
                
                {selectedSubmission.submittedAt && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Submitted At:</span> {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </div>
                )}
                
                <div className="mt-2 text-sm">
                  <span className="font-medium">Last Modified:</span> {new Date(selectedSubmission.lastModifiedAt).toLocaleString()}
                </div>

                {selectedSubmission.reviewedBy && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Reviewed By:</span> {selectedSubmission.reviewedBy.name}
                    {selectedSubmission.reviewedAt && (
                      <span className="ml-2">on {new Date(selectedSubmission.reviewedAt).toLocaleString()}</span>
                    )}
                  </div>
                )}

                {selectedSubmission.reviewComments && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Review Comments:</span>
                    <p className="mt-1 text-gray-700 bg-white p-2 rounded border">{selectedSubmission.reviewComments}</p>
                  </div>
                )}
              </div>

              {/* Theory Documents */}
              {selectedSubmission.theoryDocuments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Theory Documents ({selectedSubmission.theoryDocuments.length})</h4>
                  <div className="space-y-3">
                    {selectedSubmission.theoryDocuments.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{doc.name}</h5>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.status === 'yes' ? 'bg-green-100 text-green-800' : 
                            doc.status === 'no' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status === 'yes' ? 'Submitted' : doc.status === 'no' ? 'Not Submitted' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          Required file types: {doc.fileTypes.join(', ')}
                        </div>

                        {doc.uploadedFiles && Object.keys(doc.uploadedFiles).length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium text-gray-700 mb-1">Uploaded Files:</div>
                            <div className="space-y-1">
                              {Object.entries(doc.uploadedFiles).map(([type, file]) => (
                                <div key={type} className="text-xs bg-gray-50 p-2 rounded">
                                  <div className="font-medium">{type}:</div>
                                  <div>{file.name} ({formatFileSize(file.size)})</div>
                                  <div className="text-gray-500">Type: {file.type}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {doc.submittedAt && (
                          <div className="text-xs text-gray-500 mt-2">
                            Submitted: {new Date(doc.submittedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lab Documents */}
              {selectedSubmission.labDocuments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Lab Documents ({selectedSubmission.labDocuments.length})</h4>
                  <div className="space-y-3">
                    {selectedSubmission.labDocuments.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{doc.name}</h5>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.status === 'yes' ? 'bg-green-100 text-green-800' : 
                            doc.status === 'no' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status === 'yes' ? 'Submitted' : doc.status === 'no' ? 'Not Submitted' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          Required file types: {doc.fileTypes.join(', ')}
                        </div>

                        {doc.uploadedFiles && Object.keys(doc.uploadedFiles).length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium text-gray-700 mb-1">Uploaded Files:</div>
                            <div className="space-y-1">
                              {Object.entries(doc.uploadedFiles).map(([type, file]) => (
                                <div key={type} className="text-xs bg-gray-50 p-2 rounded">
                                  <div className="font-medium">{type}:</div>
                                  <div>{file.name} ({formatFileSize(file.size)})</div>
                                  <div className="text-gray-500">Type: {file.type}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {doc.submittedAt && (
                          <div className="text-xs text-gray-500 mt-2">
                            Submitted: {new Date(doc.submittedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedSubmission.submissionStatus === 'submitted' && selectedSubmission.overallStatus === 'pending' && (
                <div className="flex justify-center space-x-4 pt-4 border-t">
                  <button
                    onClick={() => handleUpdateStatus(selectedSubmission.id, 'in-review')}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Mark as In Review
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedSubmission.id, 'approved')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Submission
                  </button>
                  <button
                    onClick={() => {
                      const comments = prompt('Enter rejection reason:');
                      if (comments) {
                        handleUpdateStatus(selectedSubmission.id, 'rejected', comments);
                      }
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject Submission
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionTracker;

export default SubmissionTracker;
