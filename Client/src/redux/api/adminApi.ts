import { baseApi } from './baseApi';

// Types
export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  head?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isActive: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
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
  prerequisites?: {
    _id: string;
    name: string;
    code: string;
  }[];
  isActive: boolean;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
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
    firstName: string;
    lastName: string;
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
    firstName: string;
    lastName: string;
    email: string;
  };
  moduleLeader?: {
    _id: string;
    firstName: string;
    lastName: string;
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
    firstName: string;
    lastName: string;
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
  prerequisites?: string[];
  isActive?: boolean;
}

export interface UpdateCourseInput {
  name?: string;
  code?: string;
  description?: string;
  creditHours?: number;
  department?: string;
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
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
  blockedAt?: string;
  blockedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
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
}

export interface UpdateUserRoleInput {
  role: 'user' | 'admin';
}

export interface BlockUserInput {
  reason: string;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin';
  isBlocked?: boolean;
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
      providesTags: (result, error, id) => [{ type: 'Department', id }],
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
      invalidatesTags: (result, error, { id }) => [{ type: 'Department', id }, 'Department', 'Admin'],
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
      providesTags: (result, error, id) => [{ type: 'Course', id }],
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
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }, 'Course', 'Admin'],
    }),

    deleteCourse: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Course', 'Admin'],
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
      providesTags: (result, error, id) => [{ type: 'Batch', id }],
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
      invalidatesTags: (result, error, { id }) => [{ type: 'Batch', id }, 'Batch', 'Admin'],
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
      providesTags: (result, error, id) => [{ type: 'Section', id }],
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
      invalidatesTags: (result, error, { id }) => [{ type: 'Section', id }, 'Section', 'Admin'],
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
    })
  }),
});

// User Management API
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
    })
  })
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
  useDeleteUserMutation
} = adminApi;
