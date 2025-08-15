import { baseApi } from './baseApi';

export interface DocumentSubmissionData {
  courseInfo: {
    semester: string;
    courseCode: string;
    courseTitle: string;
    creditHours: string;
    courseSection: string;
    classCount: string;
    batch: string;
    department: string;
  };
  teacherInfo: {
    teacherName: string;
    employeeId: string;
    designation: string;
    emailId: string;
    mobileNumber: string;
  };
  documents: {
    theory: Array<{
      id: string;
      name: string;
      category: 'theory' | 'lab';
      fileTypes: string[];
      status: 'yes' | 'no' | 'pending';
      uploadedFiles?: Record<string, {
        name: string;
        size: number;
        type: string;
        lastModified: number;
        googleDriveId?: string;
        url?: string;
      }>;
      submittedAt?: string;
    }>;
    lab: Array<{
      id: string;
      name: string;
      category: 'theory' | 'lab';
      fileTypes: string[];
      status: 'yes' | 'no' | 'pending';
      uploadedFiles?: Record<string, {
        name: string;
        size: number;
        type: string;
        lastModified: number;
        googleDriveId?: string;
        url?: string;
      }>;
      submittedAt?: string;
    }>;
  };
  googleDriveFolders?: {
    theoryFolderId?: string;
    labFolderId?: string;
  };
}

export interface DocumentSubmissionResponse {
  _id: string;
  submissionStatus: 'draft' | 'partial' | 'complete' | 'submitted';
  overallStatus: 'pending' | 'approved' | 'rejected' | 'in-review';
  completionPercentage: number;
  submittedAt?: string;
  lastModifiedAt: string;
  courseInfo: DocumentSubmissionData['courseInfo'];
  teacherInfo: DocumentSubmissionData['teacherInfo'];
  documents: DocumentSubmissionData['documents'];
  googleDriveFolders?: DocumentSubmissionData['googleDriveFolders'];
  reviewComments?: string;
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDocumentStatusRequest {
  documentId: string;
  status: 'yes' | 'no' | 'pending';
  category: 'theory' | 'lab';
  uploadedFiles?: Record<string, {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    googleDriveId?: string;
    url?: string;
  }>;
}

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all submissions for the current user
    getDocumentSubmissions: builder.query<{ success: boolean; data: DocumentSubmissionResponse[] }, void>({
      query: () => '/documents/submissions',
      providesTags: ['DocumentSubmission'],
    }),

    // Get current or create new submission for a course
    getCurrentOrCreateSubmission: builder.query<
      { success: boolean; data: DocumentSubmissionResponse },
      { 
        courseCode: string; 
        courseSection: string; 
        semester: string;
        courseTitle?: string;
        creditHours?: string;
        classCount?: string;
        batch?: string;
        department?: string;
      }
    >({
      query: (params) => ({
        url: '/documents/submissions/current',
        params,
      }),
      providesTags: ['DocumentSubmission'],
    }),

    // Get a specific submission
    getDocumentSubmission: builder.query<{ success: boolean; data: DocumentSubmissionResponse }, string>({
      query: (id) => `/documents/submissions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'DocumentSubmission', id }],
    }),

    // Save/update document submission
    saveDocumentSubmission: builder.mutation<
      { success: boolean; data: DocumentSubmissionResponse; message: string },
      Partial<DocumentSubmissionData> & { submissionId?: string }
    >({
      query: (data) => ({
        url: '/documents/submissions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DocumentSubmission'],
    }),

    // Update individual document status within a submission
    updateDocumentStatus: builder.mutation<
      { success: boolean; data: DocumentSubmissionResponse; message: string },
      { submissionId: string } & UpdateDocumentStatusRequest
    >({
      query: ({ submissionId, ...data }) => ({
        url: `/documents/submissions/${submissionId}/documents`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { submissionId }) => [
        { type: 'DocumentSubmission', id: submissionId },
        'DocumentSubmission',
      ],
    }),

    // Submit final submission
    submitDocumentSubmission: builder.mutation<
      { success: boolean; data: DocumentSubmissionResponse; message: string },
      string
    >({
      query: (submissionId) => ({
        url: `/documents/submissions/${submissionId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, submissionId) => [
        { type: 'DocumentSubmission', id: submissionId },
        'DocumentSubmission',
      ],
    }),

    // Delete a submission (only drafts and partial)
    deleteDocumentSubmission: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/documents/submissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DocumentSubmission'],
    }),

    // Admin/Module Leader endpoints

    // Get all submissions for review
    getAllSubmissionsForReview: builder.query<
      {
        success: boolean;
        data: DocumentSubmissionResponse[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalItems: number;
          itemsPerPage: number;
        };
      },
      {
        status?: string;
        courseCode?: string;
        department?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: '/documents/submissions/review/all',
        params,
      }),
      providesTags: ['DocumentSubmission'],
    }),

    // Update submission review status
    updateSubmissionReviewStatus: builder.mutation<
      { success: boolean; data: DocumentSubmissionResponse; message: string },
      { id: string; overallStatus: 'pending' | 'approved' | 'rejected' | 'in-review'; reviewComments?: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `/documents/submissions/${id}/review`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['DocumentSubmission'],
    }),
  }),
});

export const {
  useGetDocumentSubmissionsQuery,
  useGetCurrentOrCreateSubmissionQuery,
  useGetDocumentSubmissionQuery,
  useSaveDocumentSubmissionMutation,
  useUpdateDocumentStatusMutation,
  useSubmitDocumentSubmissionMutation,
  useDeleteDocumentSubmissionMutation,
  useGetAllSubmissionsForReviewQuery,
  useUpdateSubmissionReviewStatusMutation,
} = documentApi;
