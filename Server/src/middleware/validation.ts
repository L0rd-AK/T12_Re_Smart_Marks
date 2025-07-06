import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors?.reduce((acc: any, curr: any) => {
          const path = curr.path.slice(1).join('.') || curr.path[0];
          acc[path] = curr.message;
          return acc;
        }, {}) || { validation: 'Invalid input data' }
      });
      return;
    }
  };
};
