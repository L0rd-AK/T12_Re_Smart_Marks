import Joi from 'joi';
import mongoose from 'mongoose';

// Validation for creating a course
export const createCourseSchema = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .max(100)
    .messages({
      'string.empty': 'Course name is required',
      'string.max': 'Course name cannot exceed 100 characters',
      'any.required': 'Course name is required',
    }),
  
  code: Joi.string()
    .required()
    .trim()
    .max(20)
    .pattern(/^[A-Z0-9]+$/)
    .messages({
      'string.empty': 'Course code is required',
      'string.max': 'Course code cannot exceed 20 characters',
      'string.pattern.base': 'Course code must contain only uppercase letters and numbers',
      'any.required': 'Course code is required',
    }),
  
  description: Joi.string()
    .required()
    .trim()
    .max(500)
    .messages({
      'string.empty': 'Course description is required',
      'string.max': 'Course description cannot exceed 500 characters',
      'any.required': 'Course description is required',
    }),
  
  creditHours: Joi.number()
    .required()
    .min(1)
    .max(6)
    .integer()
    .messages({
      'number.base': 'Credit hours must be a number',
      'number.min': 'Credit hours must be at least 1',
      'number.max': 'Credit hours cannot exceed 6',
      'number.integer': 'Credit hours must be a whole number',
      'any.required': 'Credit hours are required',
    }),
  
  department: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'Department is required',
      'any.invalid': 'Invalid department ID',
      'any.required': 'Department is required',
    }),
  
  prerequisites: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    )
    .optional()
    .messages({
      'array.base': 'Prerequisites must be an array',
      'any.invalid': 'Invalid prerequisite course ID',
    }),
  
  moduleLeader: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'Module leader is required',
      'any.invalid': 'Invalid module leader ID',
      'any.required': 'Module leader is required',
    }),
  
  year: Joi.string()
    .optional()
    .pattern(/^\d{4}$/)
    .messages({
      'string.pattern.base': 'Year must be a 4-digit number',
    }),
  
  semester: Joi.string()
    .optional()
    .valid('spring', 'summer', 'fall')
    .lowercase()
    .messages({
      'any.only': 'Semester must be spring, summer, or fall',
    }),
});

// Validation for updating a course
export const updateCourseSchema = Joi.object({
  name: Joi.string()
    .optional()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Course name cannot exceed 100 characters',
    }),
  
  code: Joi.string()
    .optional()
    .trim()
    .max(20)
    .pattern(/^[A-Z0-9]+$/)
    .messages({
      'string.max': 'Course code cannot exceed 20 characters',
      'string.pattern.base': 'Course code must contain only uppercase letters and numbers',
    }),
  
  description: Joi.string()
    .optional()
    .trim()
    .max(500)
    .messages({
      'string.max': 'Course description cannot exceed 500 characters',
    }),
  
  creditHours: Joi.number()
    .optional()
    .min(1)
    .max(6)
    .integer()
    .messages({
      'number.base': 'Credit hours must be a number',
      'number.min': 'Credit hours must be at least 1',
      'number.max': 'Credit hours cannot exceed 6',
      'number.integer': 'Credit hours must be a whole number',
    }),
  
  department: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.invalid': 'Invalid department ID',
    }),
  
  prerequisites: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    )
    .optional()
    .messages({
      'array.base': 'Prerequisites must be an array',
      'any.invalid': 'Invalid prerequisite course ID',
    }),
  
  moduleLeader: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.invalid': 'Invalid module leader ID',
    }),
  
  year: Joi.string()
    .optional()
    .pattern(/^\d{4}$/)
    .messages({
      'string.pattern.base': 'Year must be a 4-digit number',
    }),
  
  semester: Joi.string()
    .optional()
    .valid('spring', 'summer', 'fall')
    .lowercase()
    .messages({
      'any.only': 'Semester must be spring, summer, or fall',
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive must be a boolean',
    }),
});

// Validation for course filters
export const courseFiltersSchema = Joi.object({
  department: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.invalid': 'Invalid department ID',
    }),
  
  year: Joi.string()
    .optional()
    .pattern(/^\d{4}$/)
    .messages({
      'string.pattern.base': 'Year must be a 4-digit number',
    }),
  
  semester: Joi.string()
    .optional()
    .valid('spring', 'summer', 'fall')
    .lowercase()
    .messages({
      'any.only': 'Semester must be spring, summer, or fall',
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive must be a boolean',
    }),
  
  moduleLeader: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.invalid': 'Invalid module leader ID',
    }),
  
  search: Joi.string()
    .optional()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.min': 'Search term must be at least 1 character',
      'string.max': 'Search term cannot exceed 100 characters',
    }),
  
  page: Joi.number()
    .optional()
    .min(1)
    .integer()
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
      'number.integer': 'Page must be a whole number',
    }),
  
  limit: Joi.number()
    .optional()
    .min(1)
    .max(100)
    .integer()
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
      'number.integer': 'Limit must be a whole number',
    }),
});

// Validation for assigning module leader
export const assignModuleLeaderSchema = Joi.object({
  moduleLeaderId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'Module leader ID is required',
      'any.invalid': 'Invalid module leader ID',
      'any.required': 'Module leader ID is required',
    }),
});

// Validation for managing prerequisites
export const prerequisitesSchema = Joi.object({
  prerequisiteIds: Joi.array()
    .items(
      Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
    )
    .required()
    .min(1)
    .messages({
      'array.base': 'Prerequisite IDs must be an array',
      'array.min': 'At least one prerequisite ID is required',
      'any.invalid': 'Invalid prerequisite course ID',
      'any.required': 'Prerequisite IDs are required',
    }),
});

// Validation for bulk course creation
export const bulkCreateCoursesSchema = Joi.object({
  courses: Joi.array()
    .items(createCourseSchema)
    .required()
    .min(1)
    .max(100)
    .messages({
      'array.base': 'Courses must be an array',
      'array.min': 'At least one course is required',
      'array.max': 'Cannot create more than 100 courses at once',
      'any.required': 'Courses array is required',
    }),
});

// Validation for course ID parameter
export const courseIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'Course ID is required',
      'any.invalid': 'Invalid course ID',
      'any.required': 'Course ID is required',
    }),
});

// Validation for search query
export const searchQuerySchema = Joi.object({
  q: Joi.string()
    .required()
    .trim()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Search query is required',
      'string.min': 'Search query must be at least 1 character',
      'string.max': 'Search query cannot exceed 100 characters',
      'any.required': 'Search query is required',
    }),
});
