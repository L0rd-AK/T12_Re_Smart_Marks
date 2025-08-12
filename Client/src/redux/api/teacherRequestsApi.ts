import { baseApi } from './baseApi';
import type { TeacherCourseRequest, ModuleLeaderDocumentSubmission } from '../../types/types';

export interface UpdateCourseRequestStatusRequest {
  requestId: string;
  status: 'approved' | 'rejected';
  reviewComments?: string;
}

export interface UpdateDocumentSubmissionStatusRequest {
  submissionId: string;
  status: 'approved' | 'rejected';
  reviewComments?: string;
}

export const teacherRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all course requests for module leader
    getCourseRequests: builder.query<{ success: boolean; data: TeacherCourseRequest[] }, void>({
      query: () => ({
        url: '/module-leader/course-requests',
        method: 'GET',
      }),
      providesTags: ['DocumentSubmission'],
    }),

    // Update course request status
    updateCourseRequestStatus: builder.mutation<
      { success: boolean; message: string },
      UpdateCourseRequestStatusRequest
    >({
      query: (data) => ({
        url: `/api/module-leader/course-requests/${data.requestId}/status`,
        method: 'PATCH',
        body: {
          status: data.status,
          reviewComments: data.reviewComments,
        },
      }),
      invalidatesTags: ['DocumentSubmission'],
    }),

    // Get all document submission requests for module leader
    getDocumentSubmissionRequests: builder.query<
      { success: boolean; data: ModuleLeaderDocumentSubmission[] },
      void
    >({
      query: () => ({
        url: '/module-leader/document-submissions',
        method: 'GET',
      }),
      providesTags: ['DocumentSubmission'],
    }),

    // Update document submission status
    updateDocumentSubmissionStatus: builder.mutation<
      { success: boolean; message: string },
      UpdateDocumentSubmissionStatusRequest
    >({
      query: (data) => ({
        url: `/api/module-leader/document-submissions/${data.submissionId}/status`,
        method: 'PATCH',
        body: {
          status: data.status,
          reviewComments: data.reviewComments,
        },
      }),
      invalidatesTags: ['DocumentSubmission'],
    }),
  }),
});

export const {
  useGetCourseRequestsQuery,
  useUpdateCourseRequestStatusMutation,
  useGetDocumentSubmissionRequestsQuery,
  useUpdateDocumentSubmissionStatusMutation,
} = teacherRequestsApi; 