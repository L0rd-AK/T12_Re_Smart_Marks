import React from 'react';
import { Link, useLocation } from 'react-router';
import { useAppSelector } from '../redux/hooks';
import { getNavigationPermissions, getRoleDisplayName } from '../utils/permissions';
import type { RootState } from '../redux/store';

const RoleBasedNavigation: React.FC = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const location = useLocation();
  
  if (!user) return null;

  const permissions = getNavigationPermissions(user);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Smart Marks
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Home - available to all */}
              <Link
                to="/"
                className={`${
                  isActive('/') 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Home
              </Link>

              {/* Admin Dashboard */}
              {permissions.canViewAdmin && (
                <Link
                  to="/admin"
                  className={`${
                    isActive('/admin') 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Admin
                </Link>
              )}

              {/* Module Leader Dashboard */}
              {permissions.canViewModuleLeader && !permissions.canViewAdmin && (
                <Link
                  to="/module-leader"
                  className={`${
                    isActive('/module-leader') 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Module Leader
                </Link>
              )}

              {/* Marks Entry */}
              {permissions.canViewMarksEntry && (
                <Link
                  to="/marks-entry"
                  className={`${
                    isActive('/marks-entry') 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Marks Entry
                </Link>
              )}

              {/* Documents */}
              {permissions.canViewDocuments && (
                <Link
                  to="/document-submission"
                  className={`${
                    isActive('/document-submission') 
                      ? 'border-indigo-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Documents
                </Link>
              )}

              {/* Courses */}
              <Link
                to="/courses"
                className={`${
                  isActive('/courses') 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Courses
              </Link>
            </div>
          </div>

          {/* User info and profile link */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {getRoleDisplayName(user.role)}
              </span>
              <Link
                to="/profile"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">View profile</span>
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0)}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
