import { baseApi } from './baseApi';
import type { QuestionFormat, StudentMarks } from '../../types/types';

export interface CreateQuestionFormatRequest {
  name: string;
  questions: Array<{
    label: string;
    maxMark: number;
  }>;
}

export interface UpdateQuestionFormatRequest extends CreateQuestionFormatRequest {
  id: string;
}

export interface CreateStudentMarksRequest {
  formatId: string;
  name: string;
  marks: number[];
}

export interface UpdateStudentMarksRequest extends CreateStudentMarksRequest {
  id: string;
}

export interface BulkImportMarksRequest {
  formatId: string;
  studentsData: Array<{
    name: string;
    marks: number[];
  }>;
}

export const marksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Question Format endpoints
    getQuestionFormats: builder.query<QuestionFormat[], void>({
      query: () => '/marks/formats',
      providesTags: ['QuestionFormat'],
    }),

    getQuestionFormat: builder.query<QuestionFormat, string>({
      query: (id) => `/marks/formats/${id}`,
      providesTags: (_, __, id) => [{ type: 'QuestionFormat', id }],
    }),

    createQuestionFormat: builder.mutation<QuestionFormat, CreateQuestionFormatRequest>({
      query: (data) => ({
        url: '/marks/formats',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuestionFormat'],
    }),

    updateQuestionFormat: builder.mutation<QuestionFormat, UpdateQuestionFormatRequest>({
      query: ({ id, ...data }) => ({
        url: `/marks/formats/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'QuestionFormat', id },
        'QuestionFormat',
      ],
    }),

    deleteQuestionFormat: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/marks/formats/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['QuestionFormat'],
    }),

    // Student Marks endpoints
    getStudentMarks: builder.query<StudentMarks[], string>({
      query: (formatId) => `/marks/students?formatId=${formatId}`,
      providesTags: (result, _, formatId) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Marks' as const, id })),
              { type: 'Marks', id: `FORMAT_${formatId}` },
            ]
          : [{ type: 'Marks', id: `FORMAT_${formatId}` }],
    }),

    getStudentMark: builder.query<StudentMarks, string>({
      query: (id) => `/marks/students/${id}`,
      providesTags: (_, __, id) => [{ type: 'Marks', id }],
    }),

    createStudentMarks: builder.mutation<StudentMarks, CreateStudentMarksRequest>({
      query: (data) => ({
        url: '/marks/students',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { formatId }) => [
        { type: 'Marks', id: `FORMAT_${formatId}` },
        'Marks',
      ],
    }),

    updateStudentMarks: builder.mutation<StudentMarks, UpdateStudentMarksRequest>({
      query: ({ id, ...data }) => ({
        url: `/marks/students/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id, formatId }) => [
        { type: 'Marks', id },
        { type: 'Marks', id: `FORMAT_${formatId}` },
        'Marks',
      ],
    }),

    deleteStudentMarks: builder.mutation<{ message: string }, { id: string; formatId: string }>({
      query: ({ id }) => ({
        url: `/marks/students/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { formatId }) => [
        { type: 'Marks', id: `FORMAT_${formatId}` },
        'Marks',
      ],
    }),

    // Bulk operations
    bulkImportMarks: builder.mutation<StudentMarks[], BulkImportMarksRequest>({
      query: (data) => ({
        url: '/marks/students/bulk-import',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { formatId }) => [
        { type: 'Marks', id: `FORMAT_${formatId}` },
        'Marks',
      ],
    }),

    exportMarks: builder.query<Blob, string>({
      query: (formatId) => ({
        url: `/marks/students/export?formatId=${formatId}`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Statistics
    getMarksStatistics: builder.query<{
      totalStudents: number;
      averageScore: number;
      highestScore: number;
      lowestScore: number;
      passRate: number;
    }, string>({
      query: (formatId) => `/marks/statistics?formatId=${formatId}`,
      providesTags: (_, __, formatId) => [
        { type: 'Marks', id: `STATS_${formatId}` },
      ],
    }),
  }),
});

export const {
  // Question Format hooks
  useGetQuestionFormatsQuery,
  useGetQuestionFormatQuery,
  useCreateQuestionFormatMutation,
  useUpdateQuestionFormatMutation,
  useDeleteQuestionFormatMutation,
  
  // Student Marks hooks
  useGetStudentMarksQuery,
  useGetStudentMarkQuery,
  useCreateStudentMarksMutation,
  useUpdateStudentMarksMutation,
  useDeleteStudentMarksMutation,
  
  // Bulk operations hooks
  useBulkImportMarksMutation,
  useLazyExportMarksQuery,
  
  // Statistics hooks
  useGetMarksStatisticsQuery,
} = marksApi;
