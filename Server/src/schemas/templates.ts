import { z } from 'zod';

export const questionSchema = z.object({
  id: z.string(),
  questionNo: z.string(),
  marks: z.number().positive(),
  courseOutcomeStatements: z.string().optional(),
});

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Template name is required'),
    type: z.enum(['quiz', 'midterm', 'final']),
    year: z.string().min(4, 'Year is required'),
    courseName: z.string().min(1, 'Course name is required'),
    courseCode: z.string().min(1, 'Course code is required'),
    description: z.string().min(1, 'Description is required'),
    duration: z.number().positive('Duration must be positive'),
    instructions: z.string().optional(),
    isStandard: z.boolean(),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
  }),
});

export const updateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Template name is required').optional(),
    type: z.enum(['quiz', 'midterm', 'final']).optional(),
    year: z.string().min(4, 'Year is required').optional(),
    courseName: z.string().min(1, 'Course name is required').optional(),
    courseCode: z.string().min(1, 'Course code is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    duration: z.number().positive('Duration must be positive').optional(),
    instructions: z.string().optional(),
    isStandard: z.boolean().optional(),
    questions: z.array(questionSchema).optional(),
  }),
});

export type CreateTemplateRequest = z.infer<typeof createTemplateSchema>['body'];
export type UpdateTemplateRequest = z.infer<typeof updateTemplateSchema>['body'];
export type QuestionData = z.infer<typeof questionSchema>;