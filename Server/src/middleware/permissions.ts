import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';

export type UserRole = 'admin' | 'teacher' | 'module-leader';

// Define permissions for each role
export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: ['admin'] as UserRole[],
  MANAGE_COURSES: ['admin'] as UserRole[],
  MANAGE_DEPARTMENTS: ['admin'] as UserRole[],
  MANAGE_BATCHES: ['admin'] as UserRole[],
  MANAGE_SECTIONS: ['admin'] as UserRole[],
  VIEW_ALL_MARKS: ['admin', 'module-leader'] as UserRole[],
  
  // Teacher permissions
  ENTER_MARKS: ['admin', 'teacher', 'module-leader'] as UserRole[],
  VIEW_OWN_COURSES: ['admin', 'teacher', 'module-leader'] as UserRole[],
  MANAGE_DOCUMENTS: ['admin', 'teacher', 'module-leader'] as UserRole[],
  
  // Module Leader permissions
  MANAGE_SECTION_MARKS: ['admin', 'module-leader'] as UserRole[],
  VIEW_SECTION_REPORTS: ['admin', 'module-leader'] as UserRole[],
  
  // User permissions
  VIEW_PROFILE: ['admin', 'teacher', 'module-leader', 'user'] as UserRole[],
  UPDATE_PROFILE: ['admin', 'teacher', 'module-leader', 'user'] as UserRole[],
  VIEW_OWN_MARKS: ['admin', 'teacher', 'module-leader', 'user'] as UserRole[],
};

export type Permission = keyof typeof PERMISSIONS;

// Check if user has specific permission
export const hasPermission = (user: IUser, permission: Permission): boolean => {
  return PERMISSIONS[permission].includes(user.role as UserRole);
};

// Middleware to check permissions
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permission,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Middleware to check multiple permissions (user must have at least one)
export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasAnyPermission = permissions.some(permission => 
      hasPermission(req.user!, permission)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permissions,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user can access their own resource
export const requireOwnershipOrPermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const resourceUserId = req.params.userId || req.params.id;
    const isOwner = req.user.id === resourceUserId;
    const hasRequiredPermission = hasPermission(req.user, permission);

    if (!isOwner && !hasRequiredPermission) {
      return res.status(403).json({ 
        message: 'Access denied. You can only access your own resources or need higher permissions.',
        required: permission,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Helper function to check if user is admin
export const isAdmin = (user: IUser): boolean => {
  return user.role === 'admin';
};

// Helper function to check if user is teacher or higher
export const isTeacherOrHigher = (user: IUser): boolean => {
  return ['admin', 'teacher', 'module-leader'].includes(user.role);
};

// Helper function to check if user is module leader or higher
export const isModuleLeaderOrHigher = (user: IUser): boolean => {
  return ['admin', 'module-leader'].includes(user.role);
};
