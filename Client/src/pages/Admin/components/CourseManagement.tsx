/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  useGetCoursesQuery,
  useGetDepartmentsQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAssignCourseModuleLeaderMutation,
  useGetAvailableModuleLeadersQuery,
  type Course,
  type CreateCourseInput,
  type UpdateCourseInput,
  type User
} from '../../../redux/api/adminApi';
import LoadingSpinner from '../../../components/LoadingSpinner';

const CourseManagement: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [showModuleLeaderModal, setShowModuleLeaderModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModuleLeader, setSelectedModuleLeader] = useState<string>('');
  const [moduleLeaderSearch, setModuleLeaderSearch] = useState<string>('');
  const [formData, setFormData] = useState<CreateCourseInput>({
    name: '',
    code: '',
    description: '',
    creditHours: 3,
    department: '',
    prerequisites: [],
    isActive: true
  });

  const { data: courses, isLoading } = useGetCoursesQuery({
    department: selectedDepartment || undefined
  });
  const { data: departments } = useGetDepartmentsQuery();
  const { data: availableModuleLeaders } = useGetAvailableModuleLeadersQuery({
    search: moduleLeaderSearch || undefined,
    limit: 50
  });
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const [assignModuleLeader, { isLoading: isAssigning }] = useAssignCourseModuleLeaderMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse({
          id: editingCourse._id,
          data: formData as UpdateCourseInput
        }).unwrap();
        toast.success('Course updated successfully');
        setEditingCourse(null);
      } else {
        await createCourse(formData).unwrap();
        toast.success('Course created successfully');
        setShowCreateModal(false);
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.data?.message || 'An error occurred');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      creditHours: course.creditHours,
      department: course.department._id,
      prerequisites: course.prerequisites?.map(p => p._id) || [],
      isActive: course.isActive
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(id).unwrap();
        toast.success('Course deleted successfully');
      } catch (error: any) {
        toast.error(error.data?.message || 'An error occurred');
      }
    }
  };

  const handleAssignModuleLeader = (course: Course) => {
    setSelectedCourse(course);
    setSelectedModuleLeader(course.moduleLeader?._id || '');
    setShowModuleLeaderModal(true);
  };

  const handleModuleLeaderAssignment = async () => {
    if (!selectedCourse) return;

    try {
      await assignModuleLeader({
        id: selectedCourse._id,
        moduleLeaderId: selectedModuleLeader || undefined
      }).unwrap();
      toast.success(selectedModuleLeader ? 'Module leader assigned successfully' : 'Module leader removed successfully');
      setShowModuleLeaderModal(false);
      setSelectedCourse(null);
      setSelectedModuleLeader('');
    } catch (error: any) {
      toast.error(error.data?.message || 'An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      creditHours: 3,
      department: '',
      prerequisites: [],
      isActive: true
    });
    setShowCreateModal(false);
    setEditingCourse(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600">Manage university courses</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">All Departments</option>
            {departments?.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Course
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module Leader
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses?.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                      {course.description && (
                        <div className="text-sm text-gray-500">{course.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {course.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.department.name}</div>
                    <div className="text-sm text-gray-500">{course.department.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {course.moduleLeader ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          {course.moduleLeader.firstName} {course.moduleLeader.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{course.moduleLeader.email}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.creditHours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleAssignModuleLeader(course)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Assign Module Leader"
                      >
                        Assign ML
                      </button>
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {courses?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No courses found</div>
            <p className="text-gray-400 mt-2">Create your first course to get started</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCourse) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCourse ? 'Edit Course' : 'Create Course'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., CSE101"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Hours *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.creditHours}
                    onChange={(e) => setFormData({ ...formData, creditHours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="">Select Department</option>
                  {departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating || isUpdating ? 'Saving...' : editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Leader Assignment Modal */}
      {showModuleLeaderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Module Leader
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <input
                type="text"
                value={selectedCourse?.name}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module Leader
              </label>
              <select
                value={selectedModuleLeader}
                onChange={(e) => setSelectedModuleLeader(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">No Module Leader</option>
                {availableModuleLeaders?.teachers?.map((leader: User) => (
                  <option key={leader._id} value={leader._id}>
                    {leader.firstName} {leader.lastName} ({leader.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowModuleLeaderModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleModuleLeaderAssignment}
                disabled={isAssigning}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isAssigning ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
