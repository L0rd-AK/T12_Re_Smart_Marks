import React from 'react';
import type { QuickAction, QuickActionsProps } from './types';

const QuickActions: React.FC<QuickActionsProps> = ({
  onSendAnnouncement = () => console.log('Send announcement'),
  onScheduleMeeting = () => console.log('Schedule meeting'),
  onCreateTemplate = () => console.log('Create template'),
  onViewReports = () => console.log('View reports'),
}) => {
  const quickActions: QuickAction[] = [
    {
      id: 'announcement',
      title: 'Send Announcement',
      description: 'Notify all teachers',
      icon: '📧',
      color: 'bg-blue-50 text-blue-700',
      hoverColor: 'hover:bg-blue-100',
      onClick: onSendAnnouncement,
    },
    {
      id: 'meeting',
      title: 'Schedule Meeting',
      description: 'Plan coordination session',
      icon: '🗓️',
      color: 'bg-green-50 text-green-700',
      hoverColor: 'hover:bg-green-100',
      onClick: onScheduleMeeting,
    },
    {
      id: 'template',
      title: 'Create Template',
      description: 'Design question format',
      icon: '📝',
      color: 'bg-purple-50 text-purple-700',
      hoverColor: 'hover:bg-purple-100',
      onClick: onCreateTemplate,
    },
    {
      id: 'reports',
      title: 'View Reports',
      description: 'Generate analytics',
      icon: '📊',
      color: 'bg-orange-50 text-orange-700',
      hoverColor: 'hover:bg-orange-100',
      onClick: onViewReports,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <span className="text-sm text-gray-500">{quickActions.length} actions</span>
      </div>
      <div className="space-y-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`w-full ${action.color} ${action.hoverColor} p-3 rounded-lg text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            aria-label={`${action.title}: ${action.description}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl" role="img" aria-label={action.title}>
                {action.icon}
              </span>
              <div className="flex-1">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm opacity-80">{action.description}</div>
              </div>
              <div className="flex-shrink-0">
                <svg
                  className="w-4 h-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Additional Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">4</div>
            <div className="text-gray-500">Available Actions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">0</div>
            <div className="text-gray-500">Pending Tasks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
