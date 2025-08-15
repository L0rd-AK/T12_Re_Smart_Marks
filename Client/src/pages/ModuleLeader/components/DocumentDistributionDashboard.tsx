import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  useGetDocumentDistributionsQuery,
  useCreateDocumentDistributionMutation,
  useUpdateDocumentDistributionMutation,
  useUpdateDistributionStatusMutation,
  useUploadFilesToDistributionMutation,
  useDeleteDocumentDistributionMutation,
  useGetDistributionAnalyticsQuery,
  DocumentDistribution,
  CreateDocumentDistributionRequest
} from '../../../redux/api/documentDistributionApi';
import { useGetDepartmentCoursesQuery } from '../../../redux/api/courseAccessApi';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface CreateDistributionForm {
  title: string;
  description: string;
  category: DocumentDistribution['category'];
  tags: string[];
  priority: DocumentDistribution['priority'];
  courseId: string;
  academicYear: string;
  semester: string;
  batch: string;
  section: string;
  classCount: number;
  permissions: {
    teachers: {
      canView: boolean;
      canDownload: boolean;
      canComment: boolean;
      canEdit: boolean;
    };
    students: {
      canView: boolean;
      canDownload: boolean;
      canComment: boolean;
      canEdit: boolean;
    };
    public: {
      canView: boolean;
      canDownload: boolean;
      canComment: boolean;
      canEdit: boolean;
    };
  };
}

const DocumentDistributionDashboard: React.FC = () => {
  // State management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<DocumentDistribution | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Filters and search
  const [filters, setFilters] = useState({
    category: '',
    courseCode: '',
    department: '',
    status: '',
    priority: '',
    search: '',
    page: 1,
    limit: 10
  });

  // Form state
  const [createForm, setCreateForm] = useState<CreateDistributionForm>({
    title: '',
    description: '',
    category: 'lecture-notes',
    tags: [],
    priority: 'medium',
    courseId: '',
    academicYear: new Date().getFullYear().toString(),
    semester: '1',
    batch: '',
    section: '',
    classCount: 0,
    permissions: {
      teachers: { canView: true, canDownload: true, canComment: true, canEdit: false },
      students: { canView: true, canDownload: true, canComment: false, canEdit: false },
      public: { canView: false, canDownload: false, canComment: false, canEdit: false }
    }
  });

  // API hooks
  const { data: distributionsData, isLoading, refetch } = useGetDocumentDistributionsQuery(filters);
  const { data: coursesData } = useGetDepartmentCoursesQuery();
  const [createDistribution] = useCreateDocumentDistributionMutation();
  const [updateDistribution] = useUpdateDocumentDistributionMutation();
  const [updateStatus] = useUpdateDistributionStatusMutation();
  const [uploadFiles] = useUploadFilesToDistributionMutation();
  const [deleteDistribution] = useDeleteDocumentDistributionMutation();

  const distributions = distributionsData?.data || [];
  const courses = coursesData?.data || [];

  // Handle form changes
  const handleFormChange = (field: keyof CreateDistributionForm, value: any) => {
    setCreateForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle permission changes
  const handlePermissionChange = (role: 'teachers' | 'students' | 'public', permission: string, value: boolean) => {
    setCreateForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [role]: {
          ...prev.permissions[role],
          [permission]: value
        }
      }
    }));
  };

  // Create new distribution
  const handleCreateDistribution = async () => {
    try {
      const request: CreateDocumentDistributionRequest = {
        title: createForm.title,
        description: createForm.description,
        category: createForm.category,
        tags: createForm.tags,
        priority: createForm.priority,
        courseId: createForm.courseId,
        academicYear: createForm.academicYear,
        semester: createForm.semester,
        batch: createForm.batch,
        section: createForm.section,
        classCount: createForm.classCount,
        permissions: createForm.permissions
      };

      await createDistribution(request).unwrap();
      toast.success('Document distribution created successfully!');
      setShowCreateModal(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Failed to create document distribution');
      console.error('Error creating distribution:', error);
    }
  };

  // Upload files to distribution
  const handleUploadFiles = async () => {
    if (!selectedDistribution || selectedFiles?.length === 0) return;

    try {
      await uploadFiles({
        distributionId: selectedDistribution.distributionId,
        data: { files: selectedFiles }
      }).unwrap();
      
      toast.success('Files uploaded successfully!');
      setShowUploadModal(false);
      setSelectedFiles([]);
      refetch();
    } catch (error) {
      toast.error('Failed to upload files');
      console.error('Error uploading files:', error);
    }
  };

  // Update distribution status
  const handleStatusUpdate = async (distributionId: string, status: string, notes?: string) => {
    try {
      await updateStatus({
        distributionId,
        data: { status: status as any, notes }
      }).unwrap();
      
      toast.success('Status updated successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  // Delete distribution
  const handleDeleteDistribution = async (distributionId: string) => {
    if (!window.confirm('Are you sure you want to archive this distribution?')) return;

    try {
      await deleteDistribution(distributionId).unwrap();
      toast.success('Distribution archived successfully!');
      refetch();
    } catch (error) {
      toast.error('Failed to archive distribution');
      console.error('Error deleting distribution:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setCreateForm({
      title: '',
      description: '',
      category: 'lecture-notes',
      tags: [],
      priority: 'medium',
      courseId: '',
      academicYear: new Date().getFullYear().toString(),
      semester: '1',
      batch: '',
      section: '',
      classCount: 0,
      permissions: {
        teachers: { canView: true, canDownload: true, canComment: true, canEdit: false },
        students: { canView: true, canDownload: true, canComment: false, canEdit: false },
        public: { canView: false, canDownload: false, canComment: false, canEdit: false }
      }
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'distributed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Distribution Dashboard</h1>
        <p className="text-gray-600">Manage and track document distribution to teachers and students</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create New Distribution
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={!selectedDistribution}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Upload Files
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              placeholder="Search distributions..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="lecture-notes">Lecture Notes</option>
              <option value="assignments">Assignments</option>
              <option value="syllabus">Syllabus</option>
              <option value="reading-material">Reading Material</option>
              <option value="exams">Exams</option>
              <option value="templates">Templates</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="distributed">Distributed</option>
              <option value="archived">Archived</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Distributions List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distribution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {distributions.map((distribution) => (
                <tr key={distribution._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{distribution.title}</div>
                      <div className="text-sm text-gray-500">{distribution.description}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {distribution.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{distribution.course.courseCode}</div>
                      <div className="text-sm text-gray-500">{distribution.course.courseName}</div>
                      <div className="text-xs text-gray-400">
                        {distribution.academicInfo.academicYear} - Sem {distribution.academicInfo.semester} - {distribution.academicInfo.batch}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{distribution.fileCount} files</div>
                    <div className="text-sm text-gray-500">{formatFileSize(distribution.totalFileSize)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(distribution.distributionStatus.status)}`}>
                      {distribution.distributionStatus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(distribution.priority)}`}>
                      {distribution.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(distribution.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDistribution(distribution);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDistribution(distribution);
                          setShowUploadModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Upload
                      </button>
                      <button
                        onClick={() => handleDeleteDistribution(distribution.distributionId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Archive
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {distributionsData?.pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={filters.page >= distributionsData.pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(filters.page * filters.limit, distributionsData.pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{distributionsData.pagination.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: distributionsData.pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setFilters(prev => ({ ...prev, page }))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === filters.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Distribution Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Document Distribution</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter distribution title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="lecture-notes">Lecture Notes</option>
                    <option value="assignments">Assignments</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="reading-material">Reading Material</option>
                    <option value="exams">Exams</option>
                    <option value="templates">Templates</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                  <select
                    value={createForm.courseId}
                    onChange={(e) => handleFormChange('courseId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                  <input
                    type="text"
                    value={createForm.academicYear}
                    onChange={(e) => handleFormChange('academicYear', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                  <select
                    value={createForm.semester}
                    onChange={(e) => handleFormChange('semester', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                    <option value="3">Semester 3</option>
                    <option value="4">Semester 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
                  <input
                    type="text"
                    value={createForm.batch}
                    onChange={(e) => handleFormChange('batch', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2024-2028"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={createForm.section}
                    onChange={(e) => handleFormChange('section', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., A, B, C"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter distribution description"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={createForm.tags.join(', ')}
                  onChange={(e) => handleFormChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              {/* Permissions Section */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['teachers', 'students', 'public'] as const).map((role) => (
                    <div key={role} className="border rounded-lg p-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">{role}</h5>
                      {(['canView', 'canDownload', 'canComment', 'canEdit'] as const).map((permission) => (
                        <label key={permission} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={createForm.permissions[role][permission]}
                            onChange={(e) => handlePermissionChange(role, permission, e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-600 capitalize">
                            {permission.replace('can', '')}
                          </span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDistribution}
                  disabled={!createForm.title || !createForm.courseId || !createForm.batch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Distribution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Files Modal */}
      {showUploadModal && selectedDistribution && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Upload Files to: {selectedDistribution.title}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Files</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {selectedFiles?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                  <ul className="text-sm text-gray-600">
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name} ({formatFileSize(file.size)})</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFiles([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadFiles}
                  disabled={selectedFiles?.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Upload Files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Details Modal */}
      {showDetailsModal && selectedDistribution && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Distribution Details: {selectedDistribution.title}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Title:</span> {selectedDistribution.title}</div>
                    <div><span className="font-medium">Description:</span> {selectedDistribution.description || 'N/A'}</div>
                    <div><span className="font-medium">Category:</span> {selectedDistribution.category}</div>
                    <div><span className="font-medium">Priority:</span> {selectedDistribution.priority}</div>
                    <div><span className="font-medium">Status:</span> {selectedDistribution.distributionStatus.status}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Course Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Course:</span> {selectedDistribution.course.courseCode} - {selectedDistribution.course.courseName}</div>
                    <div><span className="font-medium">Department:</span> {selectedDistribution.course.departmentName}</div>
                    <div><span className="font-medium">Academic Year:</span> {selectedDistribution.academicInfo.academicYear}</div>
                    <div><span className="font-medium">Semester:</span> {selectedDistribution.academicInfo.semester}</div>
                    <div><span className="font-medium">Batch:</span> {selectedDistribution.academicInfo.batch}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Files ({selectedDistribution.fileCount})</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedDistribution.files.map((file, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{file.originalName}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{formatFileSize(file.fileSize)}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{file.fileType}</td>
                          <td className="px-4 py-2 text-sm font-medium">
                            <a
                              href={file.liveViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View
                            </a>
                            <a
                              href={file.downloadLink}
                              download
                              className="text-green-600 hover:text-green-900"
                            >
                              Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDistributionDashboard;
