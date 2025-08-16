import { baseApi } from './baseApi';

// Types
export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  head?: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  creditHours: number;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  moduleLeader?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  prerequisites?: {
    _id: string;
    name: string;
    code: string;
  }[];
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  _id: string;
  name: string;
  year: number;
  semester: 'Spring' | 'Summer' | 'Fall';
  startDate: string;
  endDate: string;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  _id: string;
  name: string;
  batch: {
    _id: string;
    name: string;
    year: number;
    semester: string;
  };
  course: {
    _id: string;
    name: string;
    code: string;
    creditHours: number;
  };
  instructor?: {
    _id: string;
    name: string;
    email: string;
  };
  moduleLeader?: {
    _id: string;
    name: string;
    email: string;
  };
  maxStudents: number;
  currentStudents: number;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  stats: {
    departments: number;
    courses: number;
    batches: number;
    sections: number;
    users: number;
  };
  recent: {
    departments: Department[];
    courses: Course[];
    batches: Batch[];
    sections: Section[];
  };
}

// Input types
export interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string;
  head?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  description?: string;
  head?: string;
  isActive?: boolean;
}

export interface CreateCourseInput {
  name: string;
  code: string;
  description?: string;
  creditHours: number;
  department: string;
  moduleLeader?: string;
  prerequisites?: string[];
  isActive?: boolean;
}

export interface UpdateCourseInput {
  name?: string;
  code?: string;
  description?: string;
  creditHours?: number;
  department?: string;
  moduleLeader?: string;
  prerequisites?: string[];
  isActive?: boolean;
}

export interface CreateBatchInput {
  name: string;
  year: number;
  semester: 'Spring' | 'Summer' | 'Fall';
  startDate: string;
  endDate: string;
  department: string;
  isActive?: boolean;
}

export interface UpdateBatchInput {
  name?: string;
  year?: number;
  semester?: 'Spring' | 'Summer' | 'Fall';
  startDate?: string;
  endDate?: string;
  department?: string;
  isActive?: boolean;
}

export interface CreateSectionInput {
  name: string;
  batch: string;
  course: string;
  instructor?: string;
  moduleLeader?: string;
  maxStudents: number;
  currentStudents?: number;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  isActive?: boolean;
}

export interface UpdateSectionInput {
  name?: string;
  batch?: string;
  course?: string;
  instructor?: string;
  moduleLeader?: string;
  maxStudents?: number;
  currentStudents?: number;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
  }[];
  isActive?: boolean;
}

export interface AssignModuleLeaderInput {
  sectionId: string;
  moduleLeaderId: string;
}

// User Management Types
export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: 'admin' | 'teacher' | 'module-leader' | 'user';
  isBlocked: boolean;
  blockedAt?: string;
  blockedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  blockReason?: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  adminUsers: number;
  teacherUsers: number;
  moduleLeaderUsers: number;
}

export interface UpdateUserRoleInput {
  role: 'admin' | 'teacher' | 'module-leader' | 'user';
}

export interface BlockUserInput {
  reason: string;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'teacher' | 'module-leader' | 'user';
  isBlocked?: boolean;
}

export interface AssignedModuleLeader {
  _id: string;
  course: {
    _id: string;
    name: string;
    code: string;
    creditHours: number;
  };
  department: {
    _id: string;
    name: string;
    code: string;
  };
  batch?: {
    _id: string;
    name: string;
    year: number;
    semester: string;
  };
  teacher: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    role: string;
  };
  academicYear: number;
  semester: 'Spring' | 'Summer' | 'Fall';
  assignedAt: string;
  assignedBy: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
  };
  isActive: boolean;
  remarks?: string;
  assignedTeachers: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    role: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleLeaderAssignmentInput {
  teacher: string;
  course: string;
  academicYear: number;
  semester: 'Spring' | 'Summer' | 'Fall';
  batch?: string;
  remarks?: string;
}

export interface GetAssignedModuleLeadersQuery {
  page?: number;
  limit?: number;
  teacher?: string;
  course?: string;
  department?: string;
  academicYear?: number;
  semester?: 'Spring' | 'Summer' | 'Fall';
  isActive?: boolean;
}

// Admin API
export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/admin/dashboard/stats',
      providesTags: ['Admin'],
    }),

    // Departments
    getDepartments: builder.query<Department[], void>({
      query: () => '/admin/departments',
      providesTags: ['Department'],
    }),

    getDepartment: builder.query<Department, string>({
      query: (id) => `/admin/departments/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Department', id }],
    }),

    createDepartment: builder.mutation<{ message: string; department: Department }, CreateDepartmentInput>({
      query: (data) => ({
        url: '/admin/departments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Department', 'Admin'],
    }),

    updateDepartment: builder.mutation<{ message: string; department: Department }, { id: string; data: UpdateDepartmentInput }>({
      query: ({ id, data }) => ({
        url: `/admin/departments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Department', id }, 'Department', 'Admin'],
    }),

    deleteDepartment: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department', 'Admin'],
    }),

    // Courses
    getCourses: builder.query<Course[], { department?: string }>({
      query: (params) => ({
        url: '/admin/courses',
        params,
      }),
      providesTags: ['Course'],
    }),

    getCourse: builder.query<Course, string>({
      query: (id) => `/admin/courses/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Course', id }],
    }),

    createCourse: builder.mutation<{ message: string; course: Course }, CreateCourseInput>({
      query: (data) => ({
        url: '/admin/courses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Course', 'Admin'],
    }),

    updateCourse: builder.mutation<{ message: string; course: Course }, { id: string; data: UpdateCourseInput }>({
      query: ({ id, data }) => ({
        url: `/admin/courses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Course', id }, 'Course', 'Admin'],
    }),

    deleteCourse: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course', 'Admin'],
    }),

    assignCourseModuleLeader: builder.mutation<{ message: string; course: Course }, { id: string; moduleLeaderId?: string }>({
      query: ({ id, moduleLeaderId }) => ({
        url: `/admin/courses/${id}/assign-module-leader`,
        method: 'POST',
        body: { moduleLeaderId }
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Course', id }, 'Course', 'Admin']
    }),

    getAvailableModuleLeaders: builder.query<{ teachers: User[] }, { search?: string; limit?: number }>({
      query: (params) => ({
        url: '/admin/courses/available-module-leaders',
        params
      }),
      providesTags: ['User']
    }),

    // Batches
    getBatches: builder.query<Batch[], { department?: string }>({
      query: (params) => ({
        url: '/admin/batches',
        params,
      }),
      providesTags: ['Batch'],
    }),

    getBatch: builder.query<Batch, string>({
      query: (id) => `/admin/batches/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Batch', id }],
    }),

    createBatch: builder.mutation<{ message: string; batch: Batch }, CreateBatchInput>({
      query: (data) => ({
        url: '/admin/batches',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Batch', 'Admin'],
    }),

    updateBatch: builder.mutation<{ message: string; batch: Batch }, { id: string; data: UpdateBatchInput }>({
      query: ({ id, data }) => ({
        url: `/admin/batches/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Batch', id }, 'Batch', 'Admin'],
    }),

    deleteBatch: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/batches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Batch', 'Admin'],
    }),

    // Sections
    getSections: builder.query<Section[], { batch?: string; course?: string }>({
      query: (params) => ({
        url: '/admin/sections',
        params,
      }),
      providesTags: ['Section'],
    }),

    getSection: builder.query<Section, string>({
      query: (id) => `/admin/sections/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Section', id }],
    }),

    createSection: builder.mutation<{ message: string; section: Section }, CreateSectionInput>({
      query: (data) => ({
        url: '/admin/sections',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Section', 'Admin'],
    }),

    updateSection: builder.mutation<{ message: string; section: Section }, { id: string; data: UpdateSectionInput }>({
      query: ({ id, data }) => ({
        url: `/admin/sections/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Section', id }, 'Section', 'Admin'],
    }),

    deleteSection: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/sections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Section', 'Admin'],
    }),

    // Module Leader Assignment
    assignModuleLeader: builder.mutation<{ message: string; section: Section }, AssignModuleLeaderInput>({
      query: (data) => ({
        url: '/admin/sections/assign-module-leader',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Section', 'Admin'],
    }),

    // User Management
    getUsers: builder.query<GetUsersResponse, GetUsersQuery>({
      query: (params) => ({
        url: '/admin/users',
        params
      }),
      providesTags: ['User']
    }),

    getUserStats: builder.query<UserStats, void>({
      query: () => '/admin/users/stats',
      providesTags: ['User']
    }),

    updateUserRole: builder.mutation<{ message: string; user: User }, { id: string; data: UpdateUserRoleInput }>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}/role`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['User']
    }),

    blockUser: builder.mutation<{ message: string; user: User }, { id: string; data: BlockUserInput }>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}/block`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['User']
    }),

    unblockUser: builder.mutation<{ message: string; user: User }, string>({
      query: (id) => ({
        url: `/admin/users/${id}/unblock`,
        method: 'PUT'
      }),
      invalidatesTags: ['User']
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['User']
    }),

    // Module Leader Promotion
    getAvailableTeachers: builder.query<{ teachers: User[] }, { search?: string; limit?: number }>({
      query: (params) => ({
        url: '/admin/courses/available-module-leaders',
        params
      }),
      providesTags: ['User']
    }),

    getAssignedModuleLeaders: builder.query<{ assignments: AssignedModuleLeader[]; pagination: any }, GetAssignedModuleLeadersQuery>({
      query: (params) => ({
        url: '/admin/assigned-module-leaders',
        params
      }),
      providesTags: ['AssignedModuleLeader']
    }),

    createModuleLeaderAssignment: builder.mutation<{ message: string; assignment: AssignedModuleLeader }, CreateModuleLeaderAssignmentInput>({
      query: (data) => ({
        url: '/admin/assigned-module-leaders',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['AssignedModuleLeader', 'User', 'Course']
    }),

    deactivateModuleLeaderAssignment: builder.mutation<{ message: string; assignment: AssignedModuleLeader }, string>({
      query: (id) => ({
        url: `/admin/assigned-module-leaders/${id}/deactivate`,
        method: 'PATCH'
      }),
      invalidatesTags: ['AssignedModuleLeader', 'User', 'Course']
    }),

    addTeacherToModuleLeader: builder.mutation<{ message: string; assignment: AssignedModuleLeader }, { id: string; teacherId: string }>({
      query: ({ id, teacherId }) => ({
        url: `/admin/assigned-module-leaders/${id}/add-teacher`,
        method: 'POST',
        body: { teacherId }
      }),
      invalidatesTags: ['AssignedModuleLeader', 'User']
    }),

    removeTeacherFromModuleLeader: builder.mutation<{ message: string; assignment: AssignedModuleLeader }, { id: string; teacherId: string }>({
      query: ({ id, teacherId }) => ({
        url: `/admin/assigned-module-leaders/${id}/remove-teacher/${teacherId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['AssignedModuleLeader', 'User']
    })
  }),
});

export const {
  // Dashboard
  useGetDashboardStatsQuery,

  // Departments
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,

  // Courses
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAssignCourseModuleLeaderMutation,
  useGetAvailableModuleLeadersQuery,

  // Batches
  useGetBatchesQuery,
  useGetBatchQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,

  // Sections
  useGetSectionsQuery,
  useGetSectionQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,

  // Module Leader
  useAssignModuleLeaderMutation,

  // User Management
  useGetUsersQuery,
  useGetUserStatsQuery,
  useUpdateUserRoleMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useDeleteUserMutation,

  // Module Leader Promotion
  useGetAvailableTeachersQuery,
  useGetAssignedModuleLeadersQuery,
  useCreateModuleLeaderAssignmentMutation,
  useDeactivateModuleLeaderAssignmentMutation,
  useAddTeacherToModuleLeaderMutation,
  useRemoveTeacherFromModuleLeaderMutation
} = adminApi;
