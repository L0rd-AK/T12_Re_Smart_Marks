import { baseApi } from './baseApi';

// Course interface based on the database structure
export interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  creditHours: number;
  department: string; // ObjectId reference
  prerequisites: string[]; // Array of course ObjectIds
  isActive: boolean;
  createdBy: string; // ObjectId reference
  moduleLeader: string; // ObjectId reference
  year?: string; // Optional for academic year
  semester?: string; // Optional for semester (spring, summer, fall)
  createdAt: string;
  updatedAt: string;
}

// Course with populated references
export interface CourseWithDetails extends Omit<Course, 'department' | 'prerequisites' | 'createdBy' | 'moduleLeader'> {
  department: {
    _id: string;
    name: string;
    code: string;
  };
  prerequisites: Course[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  moduleLeader: {
    _id: string;
    name: string;
    email: string;
  };
}

// Request interfaces
export interface CreateCourseRequest {
  name: string;
  code: string;
  description: string;
  creditHours: number;
  department: string; // ObjectId
  prerequisites?: string[]; // Array of course ObjectIds
  moduleLeader: string; // ObjectId
  year?: string;
  semester?: string;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  id: string;
}

export interface CourseFilters {
  department?: string;
  year?: string;
  semester?: string;
  isActive?: boolean;
  moduleLeader?: string;
  search?: string;
}

export interface CourseStatistics {
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  coursesByDepartment: Array<{
    department: string;
    count: number;
  }>;
  coursesBySemester: Array<{
    semester: string;
    count: number;
  }>;
}

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all courses with optional filters
    getCourses: builder.query<CourseWithDetails[], CourseFilters | void>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.department) params.append('department', filters.department);
        if (filters.year) params.append('year', filters.year);
        if (filters.semester) params.append('semester', filters.semester);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters.moduleLeader) params.append('moduleLeader', filters.moduleLeader);
        if (filters.search) params.append('search', filters.search);
        
        return `/courses?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Course' as const, id: _id })),
              { type: 'Course', id: 'LIST' },
            ]
          : [{ type: 'Course', id: 'LIST' }],
    }),

    // Get a single course by ID
    getCourse: builder.query<CourseWithDetails, string>({
      query: (id) => `/courses/${id}`,
      providesTags: (_, __, id) => [{ type: 'Course', id }],
    }),

    // Get courses by department
    getCoursesByDepartment: builder.query<CourseWithDetails[], string>({
      query: (departmentId) => `/courses/department/${departmentId}`,
      providesTags: (result, _, departmentId) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Course' as const, id: _id })),
              { type: 'Course', id: `DEPARTMENT_${departmentId}` },
            ]
          : [{ type: 'Course', id: `DEPARTMENT_${departmentId}` }],
    }),

    // Get courses by module leader
    getCoursesByModuleLeader: builder.query<CourseWithDetails[], string>({
      query: (moduleLeaderId) => `/courses/module-leader/${moduleLeaderId}`,
      providesTags: (result, _, moduleLeaderId) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Course' as const, id: _id })),
              { type: 'Course', id: `MODULE_LEADER_${moduleLeaderId}` },
            ]
          : [{ type: 'Course', id: `MODULE_LEADER_${moduleLeaderId}` }],
    }),

    // Get courses by year and semester
    getCoursesByYearSemester: builder.query<CourseWithDetails[], { year: string; semester: string }>({
      query: ({ year, semester }) => `/courses/year/${year}/semester/${semester}`,
      providesTags: (result, _, { year, semester }) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Course' as const, id: _id })),
              { type: 'Course', id: `YEAR_${year}_SEMESTER_${semester}` },
            ]
          : [{ type: 'Course', id: `YEAR_${year}_SEMESTER_${semester}` }],
    }),

    // Create a new course
    createCourse: builder.mutation<CourseWithDetails, CreateCourseRequest>({
      query: (data) => ({
        url: '/courses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Course', id: 'LIST' },
        { type: 'Department', id: 'LIST' },
      ],
    }),

    // Update a course
    updateCourse: builder.mutation<CourseWithDetails, UpdateCourseRequest>({
      query: ({ id, ...data }) => ({
        url: `/courses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
        { type: 'Department', id: 'LIST' },
      ],
    }),

    // Delete a course
    deleteCourse: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Course', id: 'LIST' },
        { type: 'Department', id: 'LIST' },
      ],
    }),

    // Toggle course active status
    toggleCourseStatus: builder.mutation<CourseWithDetails, string>({
      query: (id) => ({
        url: `/courses/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Assign module leader to course
    assignModuleLeader: builder.mutation<CourseWithDetails, { courseId: string; moduleLeaderId: string }>({
      query: ({ courseId, moduleLeaderId }) => ({
        url: `/courses/${courseId}/assign-module-leader`,
        method: 'PATCH',
        body: { moduleLeaderId },
      }),
      invalidatesTags: (_, __, { courseId }) => [
        { type: 'Course', id: courseId },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Add prerequisites to course
    addPrerequisites: builder.mutation<CourseWithDetails, { courseId: string; prerequisiteIds: string[] }>({
      query: ({ courseId, prerequisiteIds }) => ({
        url: `/courses/${courseId}/prerequisites`,
        method: 'POST',
        body: { prerequisiteIds },
      }),
      invalidatesTags: (_, __, { courseId }) => [
        { type: 'Course', id: courseId },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Remove prerequisites from course
    removePrerequisites: builder.mutation<CourseWithDetails, { courseId: string; prerequisiteIds: string[] }>({
      query: ({ courseId, prerequisiteIds }) => ({
        url: `/courses/${courseId}/prerequisites`,
        method: 'DELETE',
        body: { prerequisiteIds },
      }),
      invalidatesTags: (_, __, { courseId }) => [
        { type: 'Course', id: courseId },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Bulk operations
    bulkCreateCourses: builder.mutation<CourseWithDetails[], CreateCourseRequest[]>({
      query: (courses) => ({
        url: '/courses/bulk',
        method: 'POST',
        body: { courses },
      }),
      invalidatesTags: [
        { type: 'Course', id: 'LIST' },
        { type: 'Department', id: 'LIST' },
      ],
    }),

    bulkUpdateCourses: builder.mutation<CourseWithDetails[], UpdateCourseRequest[]>({
      query: (courses) => ({
        url: '/courses/bulk',
        method: 'PUT',
        body: { courses },
      }),
      invalidatesTags: [
        { type: 'Course', id: 'LIST' },
        { type: 'Department', id: 'LIST' },
      ],
    }),

    // Export courses
    exportCourses: builder.query<Blob, CourseFilters | void>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.department) params.append('department', filters.department);
        if (filters.year) params.append('year', filters.year);
        if (filters.semester) params.append('semester', filters.semester);
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters.search) params.append('search', filters.search);
        
        return {
          url: `/courses/export?${params.toString()}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    // Import courses from CSV/Excel
    importCourses: builder.mutation<{ message: string; imported: number; errors: string[] }, FormData>({
      query: (formData) => ({
        url: '/courses/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [
        { type: 'Course', id: 'LIST' },
        { type: 'Department', id: 'LIST' },
      ],
    }),

    // Get course statistics
    getCourseStatistics: builder.query<CourseStatistics, void>({
      query: () => '/courses/statistics',
      providesTags: [{ type: 'Course', id: 'STATISTICS' }],
    }),

    // Search courses
    searchCourses: builder.query<CourseWithDetails[], string>({
      query: (searchTerm) => `/courses/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: (result, _, searchTerm) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Course' as const, id: _id })),
              { type: 'Course', id: `SEARCH_${searchTerm}` },
            ]
          : [{ type: 'Course', id: `SEARCH_${searchTerm}` }],
    }),

    // Get course prerequisites
    getCoursePrerequisites: builder.query<CourseWithDetails[], string>({
      query: (courseId) => `/courses/${courseId}/prerequisites`,
      providesTags: (_, __, courseId) => [{ type: 'Course', id: `PREREQUISITES_${courseId}` }],
    }),

    // Get courses that have this course as a prerequisite
    getCoursesWithPrerequisite: builder.query<CourseWithDetails[], string>({
      query: (courseId) => `/courses/prerequisite/${courseId}`,
      providesTags: (_, __, courseId) => [{ type: 'Course', id: `HAS_PREREQUISITE_${courseId}` }],
    }),
  }),
});

export const {
  // Query hooks
  useGetCoursesQuery,
  useGetCourseQuery,
  useGetCoursesByDepartmentQuery,
  useGetCoursesByModuleLeaderQuery,
  useGetCoursesByYearSemesterQuery,
  useGetCourseStatisticsQuery,
  useSearchCoursesQuery,
  useGetCoursePrerequisitesQuery,
  useGetCoursesWithPrerequisiteQuery,
  useLazyExportCoursesQuery,

  // Mutation hooks
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useToggleCourseStatusMutation,
  useAssignModuleLeaderMutation,
  useAddPrerequisitesMutation,
  useRemovePrerequisitesMutation,
  useBulkCreateCoursesMutation,
  useBulkUpdateCoursesMutation,
  useImportCoursesMutation,
} = courseApi;

// Export types
export type { Course, CourseWithDetails, CreateCourseRequest, UpdateCourseRequest, CourseFilters, CourseStatistics };
