export type UserRole = 'admin' | 'teacher' | 'module-leader';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
}

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
  

} as const;

export type Permission = keyof typeof PERMISSIONS;

// Check if user has specific permission
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  if (!user) return false;
  return PERMISSIONS[permission].includes(user.role);
};

// Check if user has any of the specified roles
export const hasRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

// Check if user is teacher or higher
export const isTeacherOrHigher = (user: User | null): boolean => {
  return hasRole(user, ['admin', 'teacher', 'module-leader']);
};

// Check if user is module leader or higher
export const isModuleLeaderOrHigher = (user: User | null): boolean => {
  return hasRole(user, ['admin', 'module-leader']);
};

// Get user role display name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    'teacher': 'Teacher',
    'module-leader': 'Module Leader',
    'admin': 'Administrator'
  };
  
  return roleNames[role];
};

// Get available roles for user management (admin only)
export const getAvailableRoles = (): { value: UserRole; label: string }[] => {
  return [
    { value: 'teacher', label: 'Teacher' },
    { value: 'module-leader', label: 'Module Leader' },
    { value: 'admin', label: 'Administrator' }
  ];
};

// Check if user can manage another user
export const canManageUser = (currentUser: User | null, targetUser: User | null): boolean => {
  if (!currentUser || !targetUser) return false;
  
  // Only admins can manage users
  if (!isAdmin(currentUser)) return false;
  
  // Admin cannot manage themselves in certain operations
  if (currentUser.id === targetUser.id) return false;
  
  return true;
};

// Navigation permissions
export const getNavigationPermissions = (user: User | null) => {
  return {
    canViewAdmin: hasRole(user, ['admin']),
    canViewModuleLeader: hasRole(user, ['admin', 'module-leader']),
    canViewTeacher: hasRole(user, ['admin', 'teacher', 'module-leader']),
    canViewMarksEntry: hasPermission(user, 'ENTER_MARKS'),
    canViewDocuments: hasPermission(user, 'MANAGE_DOCUMENTS'),
    canViewReports: hasPermission(user, 'VIEW_ALL_MARKS'),
  };
};
