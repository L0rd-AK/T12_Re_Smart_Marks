import React from 'react';
import type { Teacher, TeacherStatusProps } from './types';

const TeacherStatus: React.FC<TeacherStatusProps> = ({
  teachers = [],
  maxTeachers = 4,
  onViewAll = () => console.log('View all teachers'),
  onTeacherClick = (teacher) => console.log('Teacher clicked:', teacher.name),
}) => {
  const defaultTeachers: Teacher[] = [
    {
      id: 'teacher1',
      name: 'Dr. Smith',
      email: 'smith@university.edu',
      department: 'Mathematics',
      subjects: ['Math 101', 'Math 201'],
      lastLogin: '2025-07-23T09:30:00Z',
      status: 'active',
      submissionRate: 95,
      responseRate: 88,
    },
    {
      id: 'teacher2',
      name: 'Prof. Johnson',
      email: 'johnson@university.edu',
      department: 'Physics',
      subjects: ['Physics 101', 'Physics Lab'],
      lastLogin: '2025-07-23T08:45:00Z',
      status: 'active',
      submissionRate: 87,
      responseRate: 92,
    },
    {
      id: 'teacher3',
      name: 'Dr. Williams',
      email: 'williams@university.edu',
      department: 'Chemistry',
      subjects: ['Chemistry 101'],
      lastLogin: '2025-07-22T16:20:00Z',
      status: 'active',
      submissionRate: 78,
      responseRate: 75,
    },
    {
      id: 'teacher4',
      name: 'Prof. Davis',
      email: 'davis@university.edu',
      department: 'Biology',
      subjects: ['Biology 101', 'Biology Lab'],
      lastLogin: '2025-07-21T14:30:00Z',
      status: 'inactive',
      submissionRate: 65,
      responseRate: 60,
    },
  ];

  const displayTeachers = teachers.length > 0 ? teachers : defaultTeachers;
  const limitedTeachers = displayTeachers.slice(0, maxTeachers);

  const formatDateTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIndicator = (status: string, lastLogin: string) => {
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
    
    if (status === 'active' && hoursSinceLogin < 24) {
      return 'bg-green-500';
    } else if (status === 'active' && hoursSinceLogin < 72) {
      return 'bg-yellow-500';
    } else {
      return 'bg-gray-400';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const activeTeachers = displayTeachers.filter(t => t.status === 'active').length;
  const averageSubmissionRate = displayTeachers.reduce((sum, teacher) => sum + teacher.submissionRate, 0) / displayTeachers.length;
  const averageResponseRate = displayTeachers.reduce((sum, teacher) => sum + teacher.responseRate, 0) / displayTeachers.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Teacher Status</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {activeTeachers}/{displayTeachers.length} active
          </span>
          <div className="w-2 h-2 bg-green-400 rounded-full" title="Online status"></div>
        </div>
      </div>

      <div className="space-y-4">
        {limitedTeachers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👥</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Teachers Found</h4>
            <p className="text-gray-600">Teacher information will appear here</p>
          </div>
        ) : (
          limitedTeachers.map((teacher) => (
            <div 
              key={teacher.id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              onClick={() => onTeacherClick(teacher)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onTeacherClick(teacher);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(teacher.name)}
                  </div>
                  <div 
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusIndicator(teacher.status, teacher.lastLogin)}`}
                    title={`${teacher.status} - Last login: ${formatDateTime(teacher.lastLogin)}`}
                  ></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{teacher.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{teacher.department}</p>
                  <p className="text-xs text-gray-500">Last: {formatDateTime(teacher.lastLogin)}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex space-x-3 text-xs mb-1">
                  <div>
                    <span className="text-gray-500">Sub:</span>
                    <span className={`font-medium ml-1 ${getPerformanceColor(teacher.submissionRate)}`}>
                      {teacher.submissionRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Resp:</span>
                    <span className={`font-medium ml-1 ${getPerformanceColor(teacher.responseRate)}`}>
                      {teacher.responseRate}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {teacher.subjects.length} subject{teacher.subjects.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {displayTeachers.length > maxTeachers && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onViewAll}
            className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View All Teachers ({displayTeachers.length})
          </button>
        </div>
      )}

      {/* Teacher Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{activeTeachers}</div>
            <div className="text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getPerformanceColor(averageSubmissionRate)}`}>
              {Math.round(averageSubmissionRate)}%
            </div>
            <div className="text-gray-500">Avg Sub</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${getPerformanceColor(averageResponseRate)}`}>
              {Math.round(averageResponseRate)}%
            </div>
            <div className="text-gray-500">Avg Resp</div>
          </div>
        </div>
      </div>

      {/* Performance Alerts */}
      {displayTeachers.filter(t => t.submissionRate < 70 || t.responseRate < 70).length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <div className="text-sm">
              <span className="font-medium text-yellow-800">
                {displayTeachers.filter(t => t.submissionRate < 70 || t.responseRate < 70).length} teacher(s)
              </span>
              <span className="text-yellow-700"> need attention</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStatus;
