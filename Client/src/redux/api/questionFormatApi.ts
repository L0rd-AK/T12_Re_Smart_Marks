import { baseApi } from "./baseApi";

// Template Types
export interface Question {
    id: string;
    questionNo: string;
    marks: number;
    courseOutcomeStatements?: string;
}

export interface Template {
    _id: string;
    name: string;
    type: 'quiz' | 'midterm' | 'final';
    year: string;
    courseName: string;
    courseCode: string;
    description: string;
    questions: Question[];
    totalMarks: number;
    duration: number;
    instructions: string;
    isStandard: boolean;
    createdAt: string;
    lastUsed?: string;
    usageCount: number;
    createdBy: string;
}

export interface CreateTemplateRequest {
    name: string;
    type: 'quiz' | 'midterm' | 'final';
    year: string;
    courseName: string;
    courseCode: string;
    description: string;
    duration: number;
    instructions?: string;
    isStandard: boolean;
    questions: Question[];
}

export interface UpdateTemplateRequest {
    name?: string;
    type?: 'quiz' | 'midterm' | 'final';
    year?: string;
    courseName?: string;
    courseCode?: string;
    description?: string;
    duration?: number;
    instructions?: string;
    isStandard?: boolean;
    questions?: Question[];
}

export interface QuestionFormatParams {
    courseCode?: string;
    year?: string;
    type?: 'quiz' | 'midterm' | 'final';
}

// Question Format & Templates API
export const questionFormatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // Get midterm templates for users
        getMidtermTemplates: builder.query<{ success: boolean; data: Template[] }, { courseCode?: string; year?: string } | void>({
            query: (params) => ({
                url: '/templates/midterm',
                params: params || {}
            }),
            providesTags: ['Templates'],
        }),

        // Get final templates for users
        getFinalTemplates: builder.query<{ success: boolean; data: Template[] }, { courseCode?: string; year?: string } | void>({
            query: (params) => ({
                url: '/templates/final',
                params: params || {}
            }),
            providesTags: ['Templates'],
        }),


    })
});

export const {
    useGetMidtermTemplatesQuery,
    useGetFinalTemplatesQuery,
} = questionFormatApi;