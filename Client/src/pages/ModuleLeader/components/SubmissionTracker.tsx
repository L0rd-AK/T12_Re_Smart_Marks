import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Submission {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  documentType: 'syllabus' | 'assignment' | 'question-paper' | 'marks' | 'attendance' | 'other';
  title: string;
  description: string;
  dueDate: string;
  submittedAt?: string;
  status: 'pending' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  comments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

interface SubmissionTracker {
  id: string;
  name: string;
  dueDate: string;
  totalTeachers: number;
  submittedCount: number;
  pendingCount: number;
  createdAt: string;
  isActive: boolean;
}

const SubmissionTracker: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: '1',
      teacherId: 'teacher1',
      teacherName: 'Dr. Smith',
      teacherEmail: 'smith@university.edu',
      documentType: 'syllabus',
      title: 'Course Syllabus - Mathematics 101',
      description: 'Updated syllabus for Fall 2025 semester',
      dueDate: '2025-08-01',
      submittedAt: '2025-07-25',
      status: 'submitted',
      priority: 'high',
      fileName: 'math101_syllabus.pdf',
      fileSize: 1024000,
    },
    {
      id: '2',
      teacherId: 'teacher2',
      teacherName: 'Prof. Johnson',
      teacherEmail: 'johnson@university.edu',
      documentType: 'assignment',
      title: 'Assignment Questions - Physics Lab',
      description: 'Lab assignment questions for week 1-4',
      dueDate: '2025-07-30',
      status: 'pending',
      priority: 'medium',
    },
    {
      id: '3',
      teacherId: 'teacher3',
      teacherName: 'Dr. Williams',
      teacherEmail: 'williams@university.edu',
      documentType: 'marks',
      title: 'Midterm Exam Marks',
      description: 'Student marks for midterm examination',
      dueDate: '2025-07-28',
      submittedAt: '2025-07-27',
      status: 'reviewed',
      priority: 'high',
      fileName: 'midterm_marks.xlsx',
      fileSize: 512000,
      reviewedBy: 'Module Leader',
      reviewedAt: '2025-07-28',
    },
  ]);

  const [trackers] = useState<SubmissionTracker[]>([
    {
      id: '1',
      name: 'Semester Syllabus Collection',
      dueDate: '2025-08-01',
      totalTeachers: 12,
      submittedCount: 8,
      pendingCount: 4,
      createdAt: '2025-07-20',
      isActive: true,
    },
    {
      id: '2',
      name: 'Mid-Semester Marks Submission',
      dueDate: '2025-07-30',
      totalTeachers: 15,
      submittedCount: 12,
      pendingCount: 3,
      createdAt: '2025-07-15',
      isActive: true,
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const [newTracker, setNewTracker] = useState({
    name: '',
    dueDate: '',
    description: '',
  });

  const filteredSubmissions = submissions.filter(submission => {
    const statusMatch = filterStatus === 'all' || submission.status === filterStatus;
    const typeMatch = filterType === 'all' || submission.documentType === filterType;
    const priorityMatch = filterPriority === 'all' || submission.priority === filterPriority;
    return statusMatch && typeMatch && priorityMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = (submissionId: string, newStatus: Submission['status'], comments?: string) => {
    setSubmissions(prev => prev.map(submission => 
      submission.id === submissionId 
        ? { 
            ...submission, 
            status: newStatus,
            comments,
            reviewedBy: 'Module Leader',
            reviewedAt: new Date().toISOString(),
          }
        : submission
    ));
    toast.success(`Submission status updated to ${newStatus}`);
  };

  const sendReminder = () => {
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    if (pendingSubmissions.length === 0) {
      toast.info('No pending submissions to remind');
      return;
    }
    
    // Simulate sending reminders
    toast.success(`Reminders sent to ${pendingSubmissions.length} teachers`);
    setShowReminderModal(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status !== 'pending') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submission Tracker</h2>
          <p className="text-gray-600 mt-1">Track and verify timely submission of required documents</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowReminderModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Send Reminders
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            New Collection
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
          <div className="text-2xl font-bold">{submissions.filter(s => s.status === 'submitted' || s.status === 'approved').length}</div>
          <div className="text-green-100">Completed</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{submissions.filter(s => s.status === 'pending').length}</div>
          <div className="text-yellow-100">Pending</div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{submissions.filter(s => isOverdue(s.dueDate, s.status)).length}</div>
          <div className="text-red-100">Overdue</div>
        </div>
      </div>

      {/* Active Trackers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Collection Campaigns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trackers.filter(t => t.isActive).map(tracker => (
            <div key={tracker.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{tracker.name}</h4>
                <span className="text-sm text-gray-500">Due: {new Date(tracker.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress:</span>
                  <span className="font-medium">{tracker.submittedCount}/{tracker.totalTeachers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(tracker.submittedCount / tracker.totalTeachers) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{tracker.submittedCount} submitted</span>
                  <span>{tracker.pendingCount} pending</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by document type"
        >
          <option value="all">All Types</option>
          <option value="syllabus">Syllabus</option>
          <option value="assignment">Assignment</option>
          <option value="question-paper">Question Paper</option>
          <option value="marks">Marks</option>
          <option value="attendance">Attendance</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by priority"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Submissions Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher & Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className={`hover:bg-gray-50 ${isOverdue(submission.dueDate, submission.status) ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{submission.teacherName}</div>
                      <div className="text-sm text-gray-500">{submission.teacherEmail}</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">{submission.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {submission.documentType}
                      </span>
                      <br />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(submission.priority)}`}>
                        {submission.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(submission.dueDate).toLocaleDateString()}
                    </div>
                    {isOverdue(submission.dueDate, submission.status) && (
                      <span className="text-xs text-red-600 font-medium">Overdue</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.submittedAt ? (
                      <div>
                        <div>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</div>
                        {submission.fileName && (
                          <div className="text-xs text-gray-500">
                            {submission.fileName} ({submission.fileSize ? formatFileSize(submission.fileSize) : 'Unknown size'})
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not submitted</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    {submission.status === 'submitted' && (
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto text-black">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Submission Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teacher</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.teacherName}</p>
                  <p className="text-sm text-gray-500">{selectedSubmission.teacherEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Type</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedSubmission.documentType}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="text-sm text-gray-900">{selectedSubmission.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{selectedSubmission.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedSubmission.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedSubmission.priority)}`}>
                    {selectedSubmission.priority}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
              </div>

              {selectedSubmission.submittedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submission Details</label>
                  <div className="text-sm text-gray-900">
                    <p>Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                    {selectedSubmission.fileName && (
                      <p>File: {selectedSubmission.fileName} ({selectedSubmission.fileSize ? formatFileSize(selectedSubmission.fileSize) : 'Unknown size'})</p>
                    )}
                  </div>
                </div>
              )}

              {selectedSubmission.comments && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comments</label>
                  <p className="text-sm text-gray-900">{selectedSubmission.comments}</p>
                </div>
              )}

              {selectedSubmission.reviewedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Review Details</label>
                  <p className="text-sm text-gray-900">
                    Reviewed by {selectedSubmission.reviewedBy} on {new Date(selectedSubmission.reviewedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
            <h3 className="text-lg font-semibold mb-4">Send Reminders</h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Send reminder emails to teachers with pending submissions?
            </p>

            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm">
                <span className="font-medium">{submissions.filter(s => s.status === 'pending').length}</span> pending submissions will receive reminders.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReminderModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendReminder}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Send Reminders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionTracker;
