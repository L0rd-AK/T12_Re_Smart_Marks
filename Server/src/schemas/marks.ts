import { z } from 'zod';

// Question Schema
const questionSchema = z.object({
  label: z.string().min(1, 'Question label is required'),
  maxMark: z.number().min(0, 'Maximum mark cannot be negative'),
});

// Create Question Format Schema
export const createQuestionFormatSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Format name must be at least 2 characters').max(100, 'Format name must be less than 100 characters'),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
  })
});

// Update Question Format Schema
export const updateQuestionFormatSchema = createQuestionFormatSchema;

// Create Student Marks Schema
export const createStudentMarksSchema = z.object({
  body: z.object({
    formatId: z.string().min(1, 'Format ID is required').optional(), // Made optional for simple marks
    name: z.string().min(1, 'Student name is required').optional(),
    studentId: z.string().min(1, 'Student ID is required'),
    marks: z.array(z.number().min(0, 'Marks cannot be negative')),
    examType: z.enum(['quiz', 'midterm', 'final', 'assignment', 'presentation', 'attendance'], {
      errorMap: () => ({ message: 'Exam type must be one of: quiz, midterm, final, assignment, presentation, attendance' }),
    }),
    maxMark: z.number().min(0, 'Maximum mark cannot be negative').optional(), // For simple marks
  })
});

// Update Student Marks Schema
export const updateStudentMarksSchema = createStudentMarksSchema;

// Bulk Import Student Marks Schema
export const bulkImportStudentMarksSchema = z.object({
  body: z.object({
    formatId: z.string().min(1, 'Format ID is required').optional(), // Made optional for simple marks
    examType: z.enum(['quiz', 'midterm', 'final', 'assignment', 'presentation', 'attendance'], {
      errorMap: () => ({ message: 'Exam type must be one of: quiz, midterm, final, assignment, presentation, attendance' }),
    }),
    studentsData: z.array(
      z.object({
        name: z.string().min(1, 'Student name is required'),
        studentId: z.string().min(1, 'Student ID is required'),
        marks: z.array(z.number().min(0, 'Marks cannot be negative')),
      })
    ).min(1, 'At least one student is required'),
  })
});

export type CreateQuestionFormatInput = z.infer<typeof createQuestionFormatSchema>['body'];
export type UpdateQuestionFormatInput = z.infer<typeof updateQuestionFormatSchema>['body'];
export type CreateStudentMarksInput = z.infer<typeof createStudentMarksSchema>['body'];
export type UpdateStudentMarksInput = z.infer<typeof updateStudentMarksSchema>['body'];
export type BulkImportStudentMarksInput = z.infer<typeof bulkImportStudentMarksSchema>['body'];
