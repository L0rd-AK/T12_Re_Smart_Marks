import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  subject: string;
  content: string;
  type: 'announcement' | 'reminder' | 'update' | 'urgent' | 'general';
  priority: 'high' | 'medium' | 'low';
  recipients: Recipient[];
  sender: string;
  sentAt: string;
  readBy: string[];
  status: 'draft' | 'sent' | 'scheduled';
  scheduledFor?: string;
  attachments?: Attachment[];
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  department?: string;
  readAt?: string;
  acknowledged?: boolean;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: 'all' | 'teachers' | 'specific';
  specificRecipients?: string[];
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

const TeacherCommunication: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      subject: 'Semester Planning Meeting - Important',
      content: 'Dear Teachers,\n\nWe have scheduled a mandatory semester planning meeting for next week. Please review the attached agenda and come prepared with your course outlines.\n\nBest regards,\nModule Leader',
      type: 'announcement',
      priority: 'high',
      recipients: [
        { id: 'teacher1', name: 'Dr. Smith', email: 'smith@university.edu', department: 'Mathematics', readAt: '2025-07-23T10:30:00Z', acknowledged: true },
        { id: 'teacher2', name: 'Prof. Johnson', email: 'johnson@university.edu', department: 'Physics', readAt: '2025-07-23T11:15:00Z' },
        { id: 'teacher3', name: 'Dr. Williams', email: 'williams@university.edu', department: 'Chemistry' },
      ],
      sender: 'Module Leader',
      sentAt: '2025-07-23T09:00:00Z',
      readBy: ['teacher1', 'teacher2'],
      status: 'sent',
    },
    {
      id: '2',
      subject: 'Submission Deadline Reminder',
      content: 'This is a friendly reminder that the deadline for submitting your course syllabi is approaching. Please submit by Friday.',
      type: 'reminder',
      priority: 'medium',
      recipients: [
        { id: 'teacher2', name: 'Prof. Johnson', email: 'johnson@university.edu', department: 'Physics' },
        { id: 'teacher4', name: 'Prof. Davis', email: 'davis@university.edu', department: 'Biology' },
      ],
      sender: 'Module Leader',
      sentAt: '2025-07-22T14:00:00Z',
      readBy: [],
      status: 'sent',
    },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Assessment Guidelines Available',
      message: 'Updated assessment guidelines have been published. Please review them before creating new assignments.',
      type: 'info',
      targetAudience: 'teachers',
      isActive: true,
      createdAt: '2025-07-23T08:00:00Z',
      expiresAt: '2025-08-23T08:00:00Z',
    },
    {
      id: '2',
      title: 'System Maintenance Scheduled',
      message: 'The system will be under maintenance this weekend. Please save your work accordingly.',
      type: 'warning',
      targetAudience: 'all',
      isActive: true,
      createdAt: '2025-07-22T16:00:00Z',
      expiresAt: '2025-07-25T16:00:00Z',
    },
  ]);

  const [teachers] = useState([
    { id: 'teacher1', name: 'Dr. Smith', email: 'smith@university.edu', department: 'Mathematics', status: 'active' },
    { id: 'teacher2', name: 'Prof. Johnson', email: 'johnson@university.edu', department: 'Physics', status: 'active' },
    { id: 'teacher3', name: 'Dr. Williams', email: 'williams@university.edu', department: 'Chemistry', status: 'active' },
    { id: 'teacher4', name: 'Prof. Davis', email: 'davis@university.edu', department: 'Biology', status: 'active' },
  ]);

  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    type: 'general' as Message['type'],
    priority: 'medium' as Message['priority'],
    scheduledFor: '',
  });

  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    targetAudience: 'teachers' as Notification['targetAudience'],
    expiresAt: '',
  });

  const handleSendMessage = () => {
    if (!newMessage.subject.trim() || !newMessage.content.trim()) {
      toast.error('Please fill in subject and content');
      return;
    }

    if (selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      ...newMessage,
      recipients: selectedRecipients.map(teacherId => {
        const teacher = teachers.find(t => t.id === teacherId);
        return {
          id: teacherId,
          name: teacher?.name || '',
          email: teacher?.email || '',
          department: teacher?.department,
        };
      }),
      sender: 'Module Leader',
      sentAt: newMessage.scheduledFor || new Date().toISOString(),
      readBy: [],
      status: newMessage.scheduledFor ? 'scheduled' : 'sent',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage({
      subject: '',
      content: '',
      type: 'general',
      priority: 'medium',
      scheduledFor: '',
    });
    setSelectedRecipients([]);
    setShowComposeModal(false);
    toast.success(newMessage.scheduledFor ? 'Message scheduled successfully' : 'Message sent successfully');
  };

  const handleCreateNotification = () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }

    const notification: Notification = {
      id: Date.now().toString(),
      ...newNotification,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [...prev, notification]);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      targetAudience: 'teachers',
      expiresAt: '',
    });
    setShowNotificationModal(false);
    toast.success('Notification created successfully');
  };

  const filteredMessages = messages.filter(message => {
    const typeMatch = filterType === 'all' || message.type === filterType;
    const statusMatch = filterStatus === 'all' || message.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'update': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'general': return 'bg-gray-100 text-gray-800';
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

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getReadPercentage = (message: Message) => {
    if (message.recipients.length === 0) return 0;
    return (message.readBy.length / message.recipients.length) * 100;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Communication</h2>
          <p className="text-gray-600 mt-1">Send messages, announcements, and manage notifications</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowNotificationModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Create Notification
          </button>
          <button
            onClick={() => setShowComposeModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Compose Message
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{messages.length}</div>
          <div className="text-blue-100">Total Messages</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{messages.filter(m => m.status === 'sent').length}</div>
          <div className="text-green-100">Sent</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{teachers.length}</div>
          <div className="text-purple-100">Active Teachers</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{notifications.filter(n => n.isActive).length}</div>
          <div className="text-orange-100">Active Notifications</div>
        </div>
      </div>

      {/* Active Notifications */}
      {notifications.filter(n => n.isActive).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Notifications</h3>
          <div className="space-y-3">
            {notifications.filter(n => n.isActive).map(notification => (
              <div key={notification.id} className={`p-4 rounded-lg border-l-4 ${
                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                notification.type === 'error' ? 'bg-red-50 border-red-400' :
                notification.type === 'success' ? 'bg-green-50 border-green-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{notification.message}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Target: {notification.targetAudience} • 
                      Created: {formatDateTime(notification.createdAt)}
                      {notification.expiresAt && ` • Expires: ${formatDateTime(notification.expiresAt)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => 
                        n.id === notification.id ? { ...n, isActive: false } : n
                      ));
                      toast.success('Notification deactivated');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by message type"
        >
          <option value="all">All Types</option>
          <option value="announcement">Announcement</option>
          <option value="reminder">Reminder</option>
          <option value="update">Update</option>
          <option value="urgent">Urgent</option>
          <option value="general">General</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by message status"
        >
          <option value="all">All Status</option>
          <option value="sent">Sent</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                    {message.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                    {message.priority}
                  </span>
                  {message.status === 'scheduled' && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                      Scheduled
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">{message.content}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">📧 Recipients:</span>
                <p className="text-sm text-gray-900">{message.recipients.length} teachers</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">📊 Read Rate:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getReadPercentage(message)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900">{Math.round(getReadPercentage(message))}%</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">📅 Sent:</span>
                <p className="text-sm text-gray-900">{formatDateTime(message.sentAt)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                {message.recipients.slice(0, 3).map((recipient) => (
                  <div
                    key={recipient.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                      message.readBy.includes(recipient.id) ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    title={`${recipient.name} - ${message.readBy.includes(recipient.id) ? 'Read' : 'Unread'}`}
                  >
                    {recipient.name.charAt(0)}
                  </div>
                ))}
                {message.recipients.length > 3 && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                    +{message.recipients.length - 3}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedMessage(message);
                    setShowMessageDetails(true);
                  }}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View Details
                </button>
                {message.status === 'sent' && (
                  <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                    Resend
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto text-black">
            <h3 className="text-lg font-semibold mb-4">Compose Message</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message subject"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as Message['type'] }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Message type"
                  >
                    <option value="general">General</option>
                    <option value="announcement">Announcement</option>
                    <option value="reminder">Reminder</option>
                    <option value="update">Update</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newMessage.priority}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value as Message['priority'] }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Message priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content *
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Enter your message content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients *
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {teachers.map(teacher => (
                    <label key={teacher.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(teacher.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRecipients(prev => [...prev, teacher.id]);
                          } else {
                            setSelectedRecipients(prev => prev.filter(id => id !== teacher.id));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {teacher.name} - {teacher.department}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule for Later (Optional)
                </label>
                <input
                  placeholder='Select date and time'
                  type="datetime-local"
                  value={newMessage.scheduledFor}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowComposeModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {newMessage.scheduledFor ? 'Schedule' : 'Send'} Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
            <h3 className="text-lg font-semibold mb-4">Create Notification</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter notification message"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as Notification['type'] }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Notification type"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience
                  </label>
                  <select
                    value={newNotification.targetAudience}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, targetAudience: e.target.value as Notification['targetAudience'] }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Target audience"
                  >
                    <option value="teachers">Teachers</option>
                    <option value="all">All Users</option>
                    <option value="specific">Specific Users</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires At (Optional)
                </label>
                <input
                  placeholder='Select expiration date and time'
                  type="datetime-local"
                  value={newNotification.expiresAt}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNotification}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Details Modal */}
      {showMessageDetails && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto text-black">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
              <button
                onClick={() => setShowMessageDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedMessage.type)}`}>
                  {selectedMessage.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                  {selectedMessage.priority}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Sent:</span>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedMessage.sentAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Read Rate:</span>
                  <p className="text-sm text-gray-900">{Math.round(getReadPercentage(selectedMessage))}% ({selectedMessage.readBy.length}/{selectedMessage.recipients.length})</p>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700 mb-2 block">Recipients:</span>
                <div className="space-y-2">
                  {selectedMessage.recipients.map((recipient) => (
                    <div key={recipient.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm font-medium">{recipient.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{recipient.email}</span>
                        {recipient.department && <span className="text-sm text-gray-500 ml-2">({recipient.department})</span>}
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedMessage.readBy.includes(recipient.id) ? (
                          <span className="text-green-600 text-sm">✓ Read</span>
                        ) : (
                          <span className="text-gray-400 text-sm">Unread</span>
                        )}
                        {recipient.readAt && (
                          <span className="text-xs text-gray-500">
                            {formatDateTime(recipient.readAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowMessageDetails(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCommunication;
