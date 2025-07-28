import React, { useState } from 'react';

interface ModuleStats {
  totalTeachers: number;
  activeTeachers: number;
  totalSections: number;
  totalStudents: number;
  documentsSubmitted: number;
  pendingSubmissions: number;
  upcomingMeetings: number;
  recentMessages: number;
}

interface RecentActivity {
  id: string;
  type: 'submission' | 'message' | 'meeting' | 'document';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  lastLogin: string;
  status: 'active' | 'inactive';
  submissionRate: number;
  responseRate: number;
}

const ModuleOverview: React.FC = () => {
  const [stats] = useState<ModuleStats>({
    totalTeachers: 15,
    activeTeachers: 12,
    totalSections: 8,
    totalStudents: 245,
    documentsSubmitted: 42,
    pendingSubmissions: 8,
    upcomingMeetings: 3,
    recentMessages: 12,
  });

  const [recentActivities] = useState<RecentActivity[]>([
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
  ]);

  const [teachers] = useState<Teacher[]>([
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
  ]);

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'semester'>('week');

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

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const averageSubmissionRate = teachers.reduce((sum, teacher) => sum + teacher.submissionRate, 0) / teachers.length;
  const averageResponseRate = teachers.reduce((sum, teacher) => sum + teacher.responseRate, 0) / teachers.length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Module Overview</h2>
          <p className="text-gray-600 mt-1">Comprehensive dashboard showing module statistics and activities</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month' | 'semester')}
            className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Select timeframe"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
          </select>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalTeachers}</div>
              <div className="text-blue-100">Total Teachers</div>
              <div className="text-sm text-blue-200 mt-1">{stats.activeTeachers} active</div>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.totalSections}</div>
              <div className="text-green-100">Active Sections</div>
              <div className="text-sm text-green-200 mt-1">{stats.totalStudents} students</div>
            </div>
            <div className="text-4xl opacity-80">📚</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.documentsSubmitted}</div>
              <div className="text-purple-100">Documents Submitted</div>
              <div className="text-sm text-purple-200 mt-1">{stats.pendingSubmissions} pending</div>
            </div>
            <div className="text-4xl opacity-80">📄</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.upcomingMeetings}</div>
              <div className="text-orange-100">Upcoming Meetings</div>
              <div className="text-sm text-orange-200 mt-1">{stats.recentMessages} recent messages</div>
            </div>
            <div className="text-4xl opacity-80">🗓️</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Average Submission Rate</span>
                <span className={`text-sm font-bold ${getPerformanceColor(averageSubmissionRate)}`}>
                  {Math.round(averageSubmissionRate)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${averageSubmissionRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Average Response Rate</span>
                <span className={`text-sm font-bold ${getPerformanceColor(averageResponseRate)}`}>
                  {Math.round(averageResponseRate)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${averageResponseRate}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Completion Rate:</span>
                  <span className="font-medium ml-2">
                    {Math.round((stats.documentsSubmitted / (stats.documentsSubmitted + stats.pendingSubmissions)) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Active Teachers:</span>
                  <span className="font-medium ml-2">
                    {Math.round((stats.activeTeachers / stats.totalTeachers) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-lg text-left transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📧</span>
                <div>
                  <div className="font-medium">Send Announcement</div>
                  <div className="text-sm text-blue-600">Notify all teachers</div>
                </div>
              </div>
            </button>

            <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-lg text-left transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🗓️</span>
                <div>
                  <div className="font-medium">Schedule Meeting</div>
                  <div className="text-sm text-green-600">Plan coordination session</div>
                </div>
              </div>
            </button>

            <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 p-3 rounded-lg text-left transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📝</span>
                <div>
                  <div className="font-medium">Create Template</div>
                  <div className="text-sm text-purple-600">Design question format</div>
                </div>
              </div>
            </button>

            <button className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 p-3 rounded-lg text-left transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📊</span>
                <div>
                  <div className="font-medium">View Reports</div>
                  <div className="text-sm text-orange-600">Generate analytics</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities and Teacher Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
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
                  <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Activities
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Status</h3>
          <div className="space-y-4">
            {teachers.slice(0, 4).map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${teacher.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{teacher.name}</h4>
                    <p className="text-xs text-gray-500">{teacher.department}</p>
                    <p className="text-xs text-gray-500">Last login: {formatDateTime(teacher.lastLogin)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex space-x-3 text-xs">
                    <div>
                      <span className="text-gray-500">Sub:</span>
                      <span className={`font-medium ${getPerformanceColor(teacher.submissionRate)}`}>
                        {teacher.submissionRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Resp:</span>
                      <span className={`font-medium ${getPerformanceColor(teacher.responseRate)}`}>
                        {teacher.responseRate}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {teacher.subjects.length} subjects
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Teachers
            </button>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
        <div className="space-y-3">
          {stats.pendingSubmissions > 5 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">High Pending Submissions</h4>
                  <p className="text-sm text-yellow-700">
                    You have {stats.pendingSubmissions} pending submissions. Consider sending reminders to teachers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {teachers.filter(t => t.submissionRate < 70).length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">🚨</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Low Performance Alert</h4>
                  <p className="text-sm text-red-700">
                    {teachers.filter(t => t.submissionRate < 70).length} teachers have submission rates below 70%. 
                    Consider reaching out for support.
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.upcomingMeetings > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400 text-xl">📅</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Upcoming Meetings</h4>
                  <p className="text-sm text-blue-700">
                    You have {stats.upcomingMeetings} meetings scheduled. Make sure to prepare agendas and materials.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleOverview;
