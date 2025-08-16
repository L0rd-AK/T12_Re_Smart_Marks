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

export interface ShareDocumentsWithTeacherRequest {
  requestId: string;
  teacherId: string;
  documentDistributionIds: string[];
  accessType?: 'view' | 'download' | 'full';
}

export const teacherRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all course requests for module leader
    getCourseRequests: builder.query<{ success: boolean; data: TeacherCourseRequest[] }, void>({
      query: () => ({
        url: '/teacher-requests',
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
        url: `/teacher-requests/${data.requestId}/status`,
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
        url: '/documents',
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
        url: `/documents/${data.submissionId}/status`,
        method: 'PATCH',
        body: {
          status: data.status,
          reviewComments: data.reviewComments,
        },
      }),
      invalidatesTags: ['DocumentSubmission'],
    }),

    // Share documents with teacher
    shareDocumentsWithTeacher: builder.mutation<
      { success: boolean; message: string; data: { sharedDocuments: string[]; accessLinks: Record<string, string> } },
      ShareDocumentsWithTeacherRequest
    >({
      query: (data) => ({
        url: `/teacher-requests/${data.requestId}/share-documents`,
        method: 'POST',
        body: {
          teacherId: data.teacherId,
          documentDistributionIds: data.documentDistributionIds,
          accessType: data.accessType || 'download',
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
  useShareDocumentsWithTeacherMutation,
} = teacherRequestsApi; 