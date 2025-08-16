import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import {
  useGetUsersQuery,
  useGetCoursesQuery,
  useGetBatchesQuery,
  useCreateModuleLeaderAssignmentMutation,
  useGetAssignedModuleLeadersQuery,
  useDeactivateModuleLeaderAssignmentMutation,
  type User,
  type Course,
  type Batch,
  type AssignedModuleLeader
} from '../../../redux/api/adminApi';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface PromotionFormData {
  teacher: string;
  course: string;
  academicYear: number;
  semester: 'Spring' | 'Summer' | 'Fall';
  batch?: string;
  remarks: string;
}

const PromoteModuleLeader: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');

  // Form data
  const [formData, setFormData] = useState<PromotionFormData>({
    teacher: '',
    course: '',
    academicYear: new Date().getFullYear(),
    semester: 'Fall',
    batch: '',
    remarks: ''
  });

  // API queries
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
    page: 1,
    limit: 1000, // Get all users
    role: 'teacher' // Filter only teachers
  });

  // Use admin API to get courses with proper structure
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesQuery();
  const { data: batchesData, isLoading: batchesLoading } = useGetBatchesQuery();
  
  const { data: assignmentsData, isLoading: assignmentsLoading } = useGetAssignedModuleLeadersQuery({
    page: currentPage,
    limit: 10,
    isActive: true
  });

  const [createAssignment, { isLoading: isCreating }] = useCreateModuleLeaderAssignmentMutation();
  const [deactivateAssignment, { isLoading: isDeactivating }] = useDeactivateModuleLeaderAssignmentMutation();

  // Filter data
  const availableTeachers = usersData?.users?.filter(teacher => 
    teacher.role === 'teacher' && 
    teacher.isBlocked !== true
  ) || [];
  
  const activeCourses = coursesData?.filter(course => course.isActive !== false) || [];
  const activeBatches = batchesData?.filter(batch => batch.isActive !== false) || [];

  // Get currently assigned teachers to exclude them from available teachers
  const assignedTeacherIds = assignmentsData?.assignments?.map(assignment => assignment.teacher._id) || [];
  const unassignedTeachers = availableTeachers.filter(teacher => !assignedTeacherIds.includes(teacher._id));

  // Filter teachers and courses based on search terms
  const filteredTeachers = unassignedTeachers.filter(teacher =>
    teacher.firstName?.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.lastName?.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.name?.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(teacherSearchTerm.toLowerCase())
  );

  const filteredCourses = activeCourses.filter(course =>
    course.name?.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
    course.department?.name?.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  const handleTeacherSelect = (teacher: User) => {
    setFormData(prev => ({ ...prev, teacher: teacher._id }));
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setFormData(prev => ({ ...prev, course: course._id }));
  };

  const handleBatchSelect = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormData(prev => ({ ...prev, batch: batch._id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacher || !formData.course) {
      toast.error('Please select both a teacher and a course');
      return;
    }

    try {
      const assignmentData = {
        teacher: formData.teacher,
        course: formData.course,
        academicYear: formData.academicYear,
        semester: formData.semester,
        batch: formData.batch || undefined,
        remarks: formData.remarks
      };

      await createAssignment(assignmentData).unwrap();
      toast.success('Teacher promoted to module leader successfully!');
      
      // Reset form
      setFormData({
        teacher: '',
        course: '',
        academicYear: new Date().getFullYear(),
        semester: 'Fall',
        batch: '',
        remarks: ''
      });
      setSelectedCourse(null);
      setSelectedBatch(null);
      setTeacherSearchTerm('');
      setCourseSearchTerm('');
      setShowPromotionForm(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to promote teacher');
    }
  };

  const handleDeactivateAssignment = async (assignmentId: string) => {
    if (window.confirm('Are you sure you want to deactivate this module leader assignment?')) {
      try {
        await deactivateAssignment(assignmentId).unwrap();
        toast.success('Assignment deactivated successfully');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to deactivate assignment');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      teacher: '',
      course: '',
      academicYear: new Date().getFullYear(),
      semester: 'Fall',
      batch: '',
      remarks: ''
    });
    setSelectedCourse(null);
    setSelectedBatch(null);
    setTeacherSearchTerm('');
    setCourseSearchTerm('');
    setShowPromotionForm(false);
  };

  if (usersLoading || coursesLoading || batchesLoading) {
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
          <h2 className="text-2xl font-bold text-gray-900">Promote Module Leader</h2>
          <p className="text-gray-600">Promote teachers to module leader roles and assign them to courses</p>
        </div>
        <button
          onClick={() => setShowPromotionForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Promote New Teacher
        </button>
      </div>

      {/* Promotion Form Modal */}
      {showPromotionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Promote Teacher to Module Leader</h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Close form"
                aria-label="Close promotion form"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Teacher Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Teacher *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={teacherSearchTerm}
                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                    placeholder="Search teachers by name or email..."
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={formData.teacher}
                    onChange={(e) => {
                      const teacher = filteredTeachers.find(t => t._id === e.target.value);
                      if (teacher) handleTeacherSelect(teacher);
                    }}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    aria-label="Select teacher"
                    title="Select teacher"
                  >
                    <option value="">Choose a teacher...</option>
                                         {filteredTeachers.map((teacher) => (
                       <option key={teacher._id} value={teacher._id}>
                         {teacher.firstName && teacher.lastName 
                           ? `${teacher.firstName} ${teacher.lastName}` 
                           : teacher.name || 'Unknown Name'} ({teacher.email})
                       </option>
                     ))}
                  </select>
                  {filteredTeachers.length === 0 && unassignedTeachers.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No teachers found matching your search.
                    </p>
                  )}
                  {unassignedTeachers.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No available teachers found. All teachers may already be assigned as module leaders.
                    </p>
                  )}
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Select Course *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={courseSearchTerm}
                    onChange={(e) => setCourseSearchTerm(e.target.value)}
                    placeholder="Search courses by name, code, or department..."
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={formData.course}
                    onChange={(e) => {
                      const course = filteredCourses.find(c => c._id === e.target.value);
                      if (course) handleCourseSelect(course);
                    }}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    aria-label="Select course"
                    title="Select course"
                  >
                    <option value="">Choose a course...</option>
                    {filteredCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.code} - {course.name} ({course.department.name})
                      </option>
                    ))}
                  </select>
                  {filteredCourses.length === 0 && activeCourses.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No courses found matching your search.
                    </p>
                  )}
                </div>
              </div>

              {/* Academic Year and Semester */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year *
                  </label>
                  <input
                    type="number"
                    value={formData.academicYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, academicYear: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().getFullYear() - 5}
                    max={new Date().getFullYear() + 5}
                    required
                    aria-label="Academic year"
                    title="Academic year"
                    placeholder="Enter academic year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester *
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value as 'Spring' | 'Summer' | 'Fall' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    aria-label="Select semester"
                    title="Select semester"
                  >
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                  </select>
                </div>
              </div>

              {/* Batch Selection (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Batch (Optional)
                </label>
                <select
                  value={formData.batch}
                  onChange={(e) => {
                    const batch = activeBatches.find(b => b._id === e.target.value);
                    handleBatchSelect(batch!);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Select batch"
                  title="Select batch"
                >
                  <option value="">No specific batch</option>
                  {activeBatches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name} ({batch.year} - {batch.semester})
                    </option>
                  ))}
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks (Optional)
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add any notes about this assignment..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !formData.teacher || !formData.course}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Promoting...' : 'Promote Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Available Teachers Summary */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Available Teachers</h3>
            <p className="text-sm text-gray-500 mt-1">
              {unassignedTeachers.length} teachers available for promotion
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{unassignedTeachers.length}</div>
            <div className="text-sm text-gray-500">Available</div>
          </div>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Module Leader Assignments</h3>
          <p className="text-sm text-gray-500 mt-1">
            View and manage active module leader assignments
          </p>
        </div>
        
        {assignmentsLoading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignmentsData?.assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                                                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                           <span className="text-sm font-medium text-blue-600">
                             {assignment.teacher.firstName?.[0] || assignment.teacher.name?.[0] || 'T'}
                             {assignment.teacher.lastName?.[0] || 'E'}
                           </span>
                         </div>
                         <div className="ml-4">
                           <div className="text-sm font-medium text-gray-900">
                             {assignment.teacher.firstName && assignment.teacher.lastName 
                               ? `${assignment.teacher.firstName} ${assignment.teacher.lastName}`
                               : assignment.teacher.name || 'Unknown Name'}
                           </div>
                           <div className="text-sm text-gray-500">{assignment.teacher.email}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.course.code}
                      </div>
                      <div className="text-sm text-gray-500">{assignment.course.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.academicYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {assignment.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.batch ? `${assignment.batch.name} (${assignment.batch.year})` : 'No specific batch'}
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                       {assignment.assignedBy.firstName && assignment.assignedBy.lastName 
                         ? `${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName}`
                         : assignment.assignedBy.name || 'Unknown Name'}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeactivateAssignment(assignment._id)}
                        disabled={isDeactivating}
                        className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {assignmentsData?.assignments.length === 0 && !assignmentsLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No active assignments</div>
            <p className="text-gray-400 mt-2">Promote a teacher to see assignments here</p>
          </div>
        )}
      </div>

      {/* Pagination for Assignments */}
      {assignmentsData?.pagination && assignmentsData.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, assignmentsData.pagination.total)} of {assignmentsData.pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: assignmentsData.pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(assignmentsData.pagination.pages, currentPage + 1))}
              disabled={currentPage === assignmentsData.pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoteModuleLeader;
