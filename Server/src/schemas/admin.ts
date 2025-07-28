import { z } from 'zod';

// Department schemas
export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Department name must be at least 2 characters')
      .max(100, 'Department name must be less than 100 characters')
      .trim(),
    code: z.string()
      .min(2, 'Department code must be at least 2 characters')
      .max(10, 'Department code must be less than 10 characters')
      .trim()
      .toUpperCase(),
    description: z.string()
      .max(500, 'Description must be less than 500 characters')
      .trim()
      .optional(),
    head: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Department name must be at least 2 characters')
      .max(100, 'Department name must be less than 100 characters')
      .trim()
      .optional(),
    code: z.string()
      .min(2, 'Department code must be at least 2 characters')
      .max(10, 'Department code must be less than 10 characters')
      .trim()
      .toUpperCase()
      .optional(),
    description: z.string()
      .max(500, 'Description must be less than 500 characters')
      .trim()
      .optional(),
    head: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

// Course schemas
export const createCourseSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Course name must be at least 2 characters')
      .max(200, 'Course name must be less than 200 characters')
      .trim(),
    code: z.string()
      .min(3, 'Course code must be at least 3 characters')
      .max(20, 'Course code must be less than 20 characters')
      .trim()
      .toUpperCase(),
    description: z.string()
      .max(1000, 'Description must be less than 1000 characters')
      .trim()
      .optional(),
    creditHours: z.number()
      .min(1, 'Credit hours must be at least 1')
      .max(10, 'Credit hours cannot exceed 10'),
    department: z.string().min(1, 'Department is required'),
    prerequisites: z.array(z.string()).optional(),
    isActive: z.boolean().optional()
  })
});

export const updateCourseSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Course name must be at least 2 characters')
      .max(200, 'Course name must be less than 200 characters')
      .trim()
      .optional(),
    code: z.string()
      .min(3, 'Course code must be at least 3 characters')
      .max(20, 'Course code must be less than 20 characters')
      .trim()
      .toUpperCase()
      .optional(),
    description: z.string()
      .max(1000, 'Description must be less than 1000 characters')
      .trim()
      .optional(),
    creditHours: z.number()
      .min(1, 'Credit hours must be at least 1')
      .max(10, 'Credit hours cannot exceed 10')
      .optional(),
    department: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
    isActive: z.boolean().optional()
  })
});

// Batch schemas
export const createBatchSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Batch name must be at least 2 characters')
      .max(50, 'Batch name must be less than 50 characters')
      .trim(),
    year: z.number()
      .min(2000, 'Year must be at least 2000')
      .max(2100, 'Year cannot exceed 2100'),
    semester: z.enum(['Spring', 'Summer', 'Fall'], {
      errorMap: () => ({ message: 'Semester must be Spring, Summer, or Fall' })
    }),
    startDate: z.string().transform((str) => new Date(str)),
    endDate: z.string().transform((str) => new Date(str)),
    department: z.string().min(1, 'Department is required'),
    isActive: z.boolean().optional()
  }).refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate']
  })
});

export const updateBatchSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Batch name must be at least 2 characters')
      .max(50, 'Batch name must be less than 50 characters')
      .trim()
      .optional(),
    year: z.number()
      .min(2000, 'Year must be at least 2000')
      .max(2100, 'Year cannot exceed 2100')
      .optional(),
    semester: z.enum(['Spring', 'Summer', 'Fall'], {
      errorMap: () => ({ message: 'Semester must be Spring, Summer, or Fall' })
    }).optional(),
    startDate: z.string().transform((str) => new Date(str)).optional(),
    endDate: z.string().transform((str) => new Date(str)).optional(),
    department: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

// Section schemas
const scheduleSchema = z.object({
  day: z.enum(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
  room: z.string().max(50, 'Room name must be less than 50 characters').optional()
});

export const createSectionSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Section name must be at least 1 character')
      .max(10, 'Section name must be less than 10 characters')
      .trim(),
    batch: z.string().min(1, 'Batch is required'),
    course: z.string().min(1, 'Course is required'),
    instructor: z.string().optional(),
    moduleLeader: z.string().optional(),
    maxStudents: z.number()
      .min(1, 'Maximum students must be at least 1')
      .max(200, 'Maximum students cannot exceed 200'),
    currentStudents: z.number()
      .min(0, 'Current students cannot be negative')
      .optional(),
    schedule: z.array(scheduleSchema).optional(),
    isActive: z.boolean().optional()
  })
});

export const updateSectionSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, 'Section name must be at least 1 character')
      .max(10, 'Section name must be less than 10 characters')
      .trim()
      .optional(),
    batch: z.string().optional(),
    course: z.string().optional(),
    instructor: z.string().optional(),
    moduleLeader: z.string().optional(),
    maxStudents: z.number()
      .min(1, 'Maximum students must be at least 1')
      .max(200, 'Maximum students cannot exceed 200')
      .optional(),
    currentStudents: z.number()
      .min(0, 'Current students cannot be negative')
      .optional(),
    schedule: z.array(scheduleSchema).optional(),
    isActive: z.boolean().optional()
  })
});

// Assign module leader schema
export const assignModuleLeaderSchema = z.object({
  body: z.object({
    sectionId: z.string().min(1, 'Section ID is required'),
    moduleLeaderId: z.string().min(1, 'Module leader ID is required')
  })
});

// User Management Schemas
export const updateUserRoleSchema = z.object({
  data: z.object({
    role: z.enum(['user', 'admin', 'teacher', 'module-leader'])
  })
});

export const blockUserSchema = z.object({
  reason: z.string().min(1, 'Block reason is required').max(500, 'Block reason must be less than 500 characters')
});

export const getUsersQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  role: z.enum(['user', 'admin', 'teacher', 'module-leader']).optional(),
  isBlocked: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
});

// Export type definitions
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>['body'];
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>['body'];
export type CreateCourseInput = z.infer<typeof createCourseSchema>['body'];
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>['body'];
export type CreateBatchInput = z.infer<typeof createBatchSchema>['body'];
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>['body'];
export type CreateSectionInput = z.infer<typeof createSectionSchema>['body'];
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>['body'];
export type AssignModuleLeaderInput = z.infer<typeof assignModuleLeaderSchema>['body'];
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
