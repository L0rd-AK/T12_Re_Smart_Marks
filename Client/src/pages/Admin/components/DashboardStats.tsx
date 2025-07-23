import React from 'react';
import type { DashboardStats as DashboardStatsType } from '../../../redux/api/adminApi';

interface DashboardStatsProps {
  stats?: DashboardStatsType;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Departments',
      value: stats.stats.departments,
      icon: '🏢',
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Courses',
      value: stats.stats.courses,
      icon: '📚',
      bgColor: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Batches',
      value: stats.stats.batches,
      icon: '👥',
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Sections',
      value: stats.stats.sections,
      icon: '📝',
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      title: 'Users',
      value: stats.stats.users,
      icon: '👤',
      bgColor: 'bg-indigo-500',
      textColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center text-white text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Departments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Departments</h3>
          {stats.recent.departments.length === 0 ? (
            <p className="text-gray-500 text-sm">No departments created yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recent.departments.map((dept) => (
                <div key={dept._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{dept.name}</p>
                    <p className="text-sm text-gray-500">Code: {dept.code}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(dept.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Courses */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Courses</h3>
          {stats.recent.courses.length === 0 ? (
            <p className="text-gray-500 text-sm">No courses created yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recent.courses.map((course) => (
                <div key={course._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{course.name}</p>
                    <p className="text-sm text-gray-500">{course.code} • {course.department.name}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Batches */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Batches</h3>
          {stats.recent.batches.length === 0 ? (
            <p className="text-gray-500 text-sm">No batches created yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recent.batches.map((batch) => (
                <div key={batch._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{batch.name}</p>
                    <p className="text-sm text-gray-500">{batch.year} {batch.semester} • {batch.department.name}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sections */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sections</h3>
          {stats.recent.sections.length === 0 ? (
            <p className="text-gray-500 text-sm">No sections created yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recent.sections.map((section) => (
                <div key={section._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">Section {section.name}</p>
                    <p className="text-sm text-gray-500">{section.course.name} • Batch: {section.batch.name}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(section.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-sm font-medium text-gray-700">Add Department</div>
          </button>
          <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm font-medium text-gray-700">Add Course</div>
          </button>
          <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium text-gray-700">Add Batch</div>
          </button>
          <button className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-medium text-gray-700">Add Section</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
