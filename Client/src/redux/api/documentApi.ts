import { baseApi } from './baseApi';

export interface DocumentSubmissionData {
  courseInfo: {
    semester: string;
    courseCode: string;
    courseTitle: string;
    creditHours: string;
    courseSection: string;
    classCount: string;
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
      status: 'yes' | 'no' | 'pending';
      fileName?: string;
    }>;
    lab: Array<{
      id: string;
      name: string;
      status: 'yes' | 'no' | 'pending';
      fileName?: string;
    }>;
  };
}

export interface DocumentSubmissionResponse {
  id: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  courseInfo: DocumentSubmissionData['courseInfo'];
  teacherInfo: DocumentSubmissionData['teacherInfo'];
  documents: DocumentSubmissionData['documents'];
}

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Submit documents
    submitDocuments: builder.mutation<DocumentSubmissionResponse, FormData>({
      query: (formData) => ({
        url: '/documents/submit',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['DocumentSubmission'],
    }),

    // Get user's document submissions
    getDocumentSubmissions: builder.query<DocumentSubmissionResponse[], void>({
      query: () => '/documents/submissions',
      providesTags: ['DocumentSubmission'],
    }),

    // Get a specific document submission
    getDocumentSubmission: builder.query<DocumentSubmissionResponse, string>({
      query: (id) => `/documents/submissions/${id}`,
      providesTags: ['DocumentSubmission'],
    }),

    // Update document submission status (for admins)
    updateDocumentSubmissionStatus: builder.mutation<
      DocumentSubmissionResponse,
      { id: string; status: 'pending' | 'approved' | 'rejected'; remarks?: string }
    >({
      query: ({ id, ...patch }) => ({
        url: `/documents/submissions/${id}/status`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['DocumentSubmission'],
    }),

    // Delete a document submission
    deleteDocumentSubmission: builder.mutation<void, string>({
      query: (id) => ({
        url: `/documents/submissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DocumentSubmission'],
    }),
  }),
});

export const {
  useSubmitDocumentsMutation,
  useGetDocumentSubmissionsQuery,
  useGetDocumentSubmissionQuery,
  useUpdateDocumentSubmissionStatusMutation,
  useDeleteDocumentSubmissionMutation,
} = documentApi;
