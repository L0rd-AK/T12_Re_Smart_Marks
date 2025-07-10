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
  formatId?: string; // Optional for simple marks (quiz, assignment, presentation)
  name?: string;
  studentId: string;
  marks: number[]; // For detailed: array of question marks; For simple: single mark in array
  examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'presentation' | 'attendance';
  maxMark?: number; // For simple marks - the maximum possible mark
}

export interface UpdateStudentMarksRequest extends CreateStudentMarksRequest {
  id: string;
}

export interface CreateSimpleMarkRequest {
  name: string;
  studentId: string;
  mark: number;
  maxMark: number;
  examType: 'quiz' | 'assignment' | 'presentation' | 'attendance';
}

export interface UpdateSimpleMarkRequest extends CreateSimpleMarkRequest {
  id: string;
}

export interface BulkImportMarksRequest {
  formatId?: string; // Optional for simple marks
  examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'presentation' | 'attendance';
  studentsData: Array<{
    name: string;
    studentId: string;
    marks: number[];
  }>;
}

export interface StudentMarksSummary {
  studentId: string;
  name: string;
  quizzes: {
    count: number;
    marks: Array<{
      id: string;
      formatName: string;
      total: number;
      createdAt: string;
    }>;
    average: number;
    weight: number;
    weightedScore: number;
  };
  midterms: {
    count: number;
    marks: Array<{
      id: string;
      formatName: string;
      total: number;
      createdAt: string;
    }>;
    average: number;
    weight: number;
    weightedScore: number;
  };
  finals: {
    count: number;
    marks: Array<{
      id: string;
      formatName: string;
      total: number;
      createdAt: string;
    }>;
    average: number;
    weight: number;
    weightedScore: number;
  };
  assignments?: {
    count: number;
    marks: Array<{
      id: string;
      formatName: string;
      total: number;
      createdAt: string;
    }>;
    average: number;
    weight: number;
    weightedScore: number;
  };
  presentations?: {
    count: number;
    marks: Array<{
      id: string;
      formatName: string;
      total: number;
      createdAt: string;
    }>;
    average: number;
    weight: number;
    weightedScore: number;
  };
  attendance?: {
    count: number;
    marks: Array<{
      id: string;
      formatName: string;
      total: number;
      createdAt: string;
    }>;
    average: number;
    weight: number;
    weightedScore: number;
  };
  overall: {
    totalMarks: number;
    average: number;
    finalGrade: number;
    gradeBreakdown: {
      quiz: string;
      midterm: string;
      final: string;
      assignment: string;
      presentation: string;
      attendance: string;
    };
  };
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
      query: (formatId) => `/marks/students/format/${formatId}`,
      providesTags: (result, _, formatId) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Marks' as const, id })),
              { type: 'Marks', id: `FORMAT_${formatId}` },
            ]
          : [{ type: 'Marks', id: `FORMAT_${formatId}` }],
    }),

    getStudentMarksByType: builder.query<StudentMarks[], string>({
      query: (examType) => `/marks/students/type/${examType}`,
      providesTags: (result, _, examType) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Marks' as const, id })),
              { type: 'Marks', id: `TYPE_${examType}` },
            ]
          : [{ type: 'Marks', id: `TYPE_${examType}` }],
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
      invalidatesTags: (_, __, { formatId, examType }) => {
        const tags: Array<{ type: 'Marks'; id?: string } | 'Marks'> = ['Marks'];
        if (formatId) {
          tags.push({ type: 'Marks', id: `FORMAT_${formatId}` });
        } else {
          tags.push({ type: 'Marks', id: `TYPE_${examType}` });
        }
        return tags;
      },
    }),

    updateStudentMarks: builder.mutation<StudentMarks, UpdateStudentMarksRequest>({
      query: ({ id, ...data }) => ({
        url: `/marks/students/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id, formatId, examType }) => {
        const tags: Array<{ type: 'Marks'; id?: string } | 'Marks'> = [
          { type: 'Marks', id },
          'Marks',
        ];
        if (formatId) {
          tags.push({ type: 'Marks', id: `FORMAT_${formatId}` });
        } else {
          tags.push({ type: 'Marks', id: `TYPE_${examType}` });
        }
        return tags;
      },
    }),

    deleteStudentMarks: builder.mutation<{ message: string }, { id: string; formatId?: string; examType?: string }>({
      query: ({ id }) => ({
        url: `/marks/students/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, { formatId, examType }) => {
        const tags: Array<{ type: 'Marks'; id?: string } | 'Marks'> = ['Marks'];
        if (formatId) {
          tags.push({ type: 'Marks', id: `FORMAT_${formatId}` });
        } else if (examType) {
          tags.push({ type: 'Marks', id: `TYPE_${examType}` });
        }
        return tags;
      },
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

    // Get a student marks summary
    getStudentMarksSummary: builder.query<StudentMarksSummary, string>({
      query: (studentId) => `/marks/students/summary/${studentId}`,
      providesTags: (_, __, studentId) => [{ type: 'Marks' as const, id: `summary-${studentId}` }],
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
  useGetStudentMarksByTypeQuery,
  useGetStudentMarkQuery,
  useCreateStudentMarksMutation,
  useUpdateStudentMarksMutation,
  useDeleteStudentMarksMutation,
  
  // Bulk operations hooks
  useBulkImportMarksMutation,
  useLazyExportMarksQuery,
  
  // Statistics hooks
  useGetMarksStatisticsQuery,
  
  // Student Marks Summary hooks
  useGetStudentMarksSummaryQuery,
} = marksApi;
