import { baseApi } from './baseApi';

export interface CourseAccessRequest {
    _id: string;
    course: {
        _id: string;
        name: string;
        code: string;
        creditHours: number;
        department: {
            _id: string;
            name: string;
            code: string;
        };
    };
    teacher: {
        _id: string;
        name: string;
        email: string;
        employeeId?: string;
        designation?: string;
    };
    moduleLeader: {
        _id: string;
        name: string;
        email: string;
        employeeId?: string;
        designation?: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    message: string;
    requestDate: string;
    responseDate?: string;
    responseMessage?: string;
    respondedBy?: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Course {
    id: string;
    code: string;
    title: string;
    department: string;
    semester: string;
    creditHours: number;
    moduleLeader: string;
    moduleLeaderEmail: string;
    enrolledTeachers: string[];
    status: 'active' | 'inactive';
    documentProgress: number;
    hasAccess?: boolean;
    sectionId?: string;
    sectionName?: string;
    maxStudents?: number;
    currentStudents?: number;
}

export interface CreateAccessRequestData {
    courseId: string;
    message: string;
}

export interface RespondToRequestData {
    status: 'approved' | 'rejected';
    responseMessage?: string;
}

export const courseAccessApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Teacher endpoints
        createAccessRequest: builder.mutation<{ success: boolean; message: string; data: CourseAccessRequest },CreateAccessRequestData>({
            query: (data) => ({
                url: '/course-access/request',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Course'],
        }),

        getMyRequests: builder.query<{ success: boolean; data: CourseAccessRequest[] }, void>({
            query: () => '/course-access/my-requests',
            providesTags: ['Course'],
        }),

        getMyCourses: builder.query<{ success: boolean; data: Course[] }, void>({
            query: () => '/course-access/my-courses',
            providesTags: ['Course'],
        }),

        getDepartmentCourses: builder.query<{ success: boolean; data: Course[] },void>({
            query: () => '/course-access/department-courses',
            providesTags: ['Course'],
        }),

        // Module leader endpoints
        getPendingRequests: builder.query<{ success: boolean; data: CourseAccessRequest[] },void>({
            query: () => '/course-access/pending-requests',
            providesTags: ['Course'],
        }),

        getAllRequests: builder.query<{ success: boolean; data: CourseAccessRequest[] },void>({
            query: () => '/course-access/all-requests',
            providesTags: ['Course'],
        }),

        respondToRequest: builder.mutation< { success: boolean; message: string; data: CourseAccessRequest },{ requestId: string; data: RespondToRequestData }>({
            query: ({ requestId, data }) => ({
                url: `/course-access/respond/${requestId}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Course'],
        }),
    }),
});

export const {
    useCreateAccessRequestMutation,
    useGetMyRequestsQuery,
    useGetMyCoursesQuery,
    useGetDepartmentCoursesQuery,
    useGetPendingRequestsQuery,
    useGetAllRequestsQuery,
    useRespondToRequestMutation,
} = courseAccessApi;
