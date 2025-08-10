import React from 'react';
import type { RecentActivity, RecentActivitiesProps } from './types';

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities = [],
  maxActivities = 5,
  onViewAll = () => console.log('View all activities'),
}) => {
  const defaultActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'submission',
      title: 'Course Syllabus Submitted',
      description: 'Dr. Smith submitted Mathematics 101 syllabus',
      timestamp: '2025-07-23T10:30:00Z',
      status: 'completed',
    },
    {
      id: '2',
      type: 'message',
      title: 'Announcement Sent',
      description: 'Semester Planning Meeting announcement sent to all teachers',
      timestamp: '2025-07-23T09:00:00Z',
      priority: 'high',
    },
    {
      id: '3',
      type: 'meeting',
      title: 'Meeting Scheduled',
      description: 'Weekly Progress Review meeting scheduled for tomorrow',
      timestamp: '2025-07-22T16:45:00Z',
      status: 'scheduled',
    },
    {
      id: '4',
      type: 'document',
      title: 'Template Created',
      description: 'New question paper template for Midterm exams created',
      timestamp: '2025-07-22T14:20:00Z',
      status: 'active',
    },
    {
      id: '5',
      type: 'submission',
      title: 'Marks Submitted',
      description: 'Prof. Johnson submitted Physics lab marks',
      timestamp: '2025-07-22T11:15:00Z',
      status: 'under-review',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;
  const limitedActivities = displayActivities.slice(0, maxActivities);

  const formatDateTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} days ago`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission': return '📄';
      case 'message': return '💬';
      case 'meeting': return '🗓️';
      case 'document': return '📝';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string, type: string) => {
    if (type === 'submission') {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'under-review': return 'bg-yellow-100 text-yellow-800';
        case 'pending': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'submission': return 'text-blue-600';
      case 'message': return 'text-green-600';
      case 'meeting': return 'text-purple-600';
      case 'document': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {limitedActivities.length} of {displayActivities.length}
          </span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live updates"></div>
        </div>
      </div>

      <div className="space-y-4">
        {limitedActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📭</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Activities</h4>
            <p className="text-gray-600">Activities will appear here as they happen</p>
          </div>
        ) : (
          limitedActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex-shrink-0">
                <span className="text-xl" role="img" aria-label={activity.type}>
                  {getActivityIcon(activity.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className={`text-sm font-medium truncate ${getTypeColor(activity.type)}`}>
                    {activity.title}
                  </h4>
                  {activity.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status, activity.type)}`}>
                      {activity.status}
                    </span>
                  )}
                  {activity.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                      {activity.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1 line-clamp-2">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                  <span className={`text-xs font-medium ${getTypeColor(activity.type)}`}>
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {displayActivities.length > maxActivities && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onViewAll}
            className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View All Activities ({displayActivities.length})
          </button>
        </div>
      )}

      {/* Activity Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-2 text-xs">
          {['submission', 'message', 'meeting', 'document'].map((type) => {
            const count = displayActivities.filter(a => a.type === type).length;
            return (
              <div key={type} className="text-center">
                <div className={`text-sm font-bold ${getTypeColor(type)}`}>{count}</div>
                <div className="text-gray-500 capitalize">{type}s</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
