import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Meeting {
  id: string;
  title: string;
  description: string;
  type: 'planning' | 'progress' | 'review' | 'coordination' | 'other';
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  organizer: string;
  attendees: Attendee[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  agenda: AgendaItem[];
  notes?: string;
  createdAt: string;
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin' | 'coordinator';
  department?: string;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
  responseAt?: string;
}

interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  presenter?: string;
  order: number;
}

const MeetingScheduler: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Weekly Progress Review',
      description: 'Review progress on curriculum implementation and discuss any issues',
      type: 'progress',
      date: '2025-07-30',
      time: '10:00',
      duration: 60,
      location: 'Conference Room A',
      isVirtual: false,
      organizer: 'Module Leader',
      attendees: [
        { id: 'teacher1', name: 'Dr. Smith', email: 'smith@university.edu', role: 'teacher', status: 'accepted' },
        { id: 'teacher2', name: 'Prof. Johnson', email: 'johnson@university.edu', role: 'teacher', status: 'tentative' },
        { id: 'teacher3', name: 'Dr. Williams', email: 'williams@university.edu', role: 'teacher', status: 'invited' },
      ],
      status: 'scheduled',
      agenda: [
        { id: '1', title: 'Welcome & Introductions', duration: 10, order: 1 },
        { id: '2', title: 'Curriculum Progress Update', duration: 25, order: 2, presenter: 'Dr. Smith' },
        { id: '3', title: 'Issue Discussion', duration: 20, order: 3 },
        { id: '4', title: 'Next Steps & Action Items', duration: 5, order: 4 },
      ],
      createdAt: '2025-07-23',
    },
    {
      id: '2',
      title: 'Semester Planning Session',
      description: 'Plan activities and assignments for the upcoming semester',
      type: 'planning',
      date: '2025-08-05',
      time: '14:00',
      duration: 120,
      location: 'Virtual Meeting',
      isVirtual: true,
      meetingLink: 'https://zoom.us/j/123456789',
      organizer: 'Module Leader',
      attendees: [
        { id: 'teacher1', name: 'Dr. Smith', email: 'smith@university.edu', role: 'teacher', status: 'accepted' },
        { id: 'teacher4', name: 'Prof. Davis', email: 'davis@university.edu', role: 'teacher', status: 'accepted' },
      ],
      status: 'scheduled',
      agenda: [
        { id: '1', title: 'Semester Overview', duration: 30, order: 1 },
        { id: '2', title: 'Assignment Planning', duration: 45, order: 2 },
        { id: '3', title: 'Resource Allocation', duration: 30, order: 3 },
        { id: '4', title: 'Timeline & Milestones', duration: 15, order: 4 },
      ],
      createdAt: '2025-07-22',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    type: 'planning' as Meeting['type'],
    date: '',
    time: '',
    duration: 60,
    location: '',
    isVirtual: false,
    meetingLink: '',
  });

  const [teachers] = useState([
    { id: 'teacher1', name: 'Dr. Smith', email: 'smith@university.edu', department: 'Mathematics' },
    { id: 'teacher2', name: 'Prof. Johnson', email: 'johnson@university.edu', department: 'Physics' },
    { id: 'teacher3', name: 'Dr. Williams', email: 'williams@university.edu', department: 'Chemistry' },
    { id: 'teacher4', name: 'Prof. Davis', email: 'davis@university.edu', department: 'Biology' },
  ]);

  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  const handleCreateMeeting = () => {
    if (!newMeeting.title.trim() || !newMeeting.date || !newMeeting.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    const meeting: Meeting = {
      id: Date.now().toString(),
      ...newMeeting,
      organizer: 'Module Leader',
      attendees: selectedAttendees.map(teacherId => {
        const teacher = teachers.find(t => t.id === teacherId);
        return {
          id: teacherId,
          name: teacher?.name || '',
          email: teacher?.email || '',
          role: 'teacher' as const,
          department: teacher?.department,
          status: 'invited' as const,
        };
      }),
      status: 'scheduled',
      agenda: [],
      createdAt: new Date().toISOString(),
    };

    setMeetings(prev => [...prev, meeting]);
    setNewMeeting({
      title: '',
      description: '',
      type: 'planning',
      date: '',
      time: '',
      duration: 60,
      location: '',
      isVirtual: false,
      meetingLink: '',
    });
    setSelectedAttendees([]);
    setShowCreateModal(false);
    toast.success('Meeting scheduled successfully');
  };

  const filteredMeetings = meetings.filter(meeting => {
    const typeMatch = filterType === 'all' || meeting.type === filterType;
    const statusMatch = filterStatus === 'all' || meeting.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-green-100 text-green-800';
      case 'coordination': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'tentative': return 'bg-yellow-100 text-yellow-800';
      case 'invited': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString();
  };

  const isUpcoming = (date: string, time: string) => {
    return new Date(`${date}T${time}`) > new Date();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Scheduler</h2>
          <p className="text-gray-600 mt-1">Schedule and coordinate meetings with teachers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Schedule Meeting
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{meetings.length}</div>
          <div className="text-blue-100">Total Meetings</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{meetings.filter(m => m.status === 'scheduled' && isUpcoming(m.date, m.time)).length}</div>
          <div className="text-green-100">Upcoming</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{meetings.filter(m => m.status === 'completed').length}</div>
          <div className="text-purple-100">Completed</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{meetings.reduce((sum, m) => sum + m.attendees.length, 0)}</div>
          <div className="text-orange-100">Total Attendees</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by meeting type"
        >
          <option value="all">All Types</option>
          <option value="planning">Planning</option>
          <option value="progress">Progress</option>
          <option value="review">Review</option>
          <option value="coordination">Coordination</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter by meeting status"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.map((meeting) => (
          <div key={meeting.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(meeting.type)}`}>
                    {meeting.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                    {meeting.status}
                  </span>
                  {isUpcoming(meeting.date, meeting.time) && meeting.status === 'scheduled' && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      Upcoming
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{meeting.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700">📅 Date & Time:</span>
                <p className="text-sm text-gray-900">{formatDateTime(meeting.date, meeting.time)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">⏱️ Duration:</span>
                <p className="text-sm text-gray-900">{meeting.duration} minutes</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">📍 Location:</span>
                <p className="text-sm text-gray-900">
                  {meeting.isVirtual ? (
                    <span className="text-blue-600">Virtual Meeting</span>
                  ) : (
                    meeting.location
                  )}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-sm font-medium text-gray-700">👥 Attendees ({meeting.attendees.length}):</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {meeting.attendees.map((attendee) => (
                  <div key={attendee.id} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-1">
                    <span className="text-sm text-gray-900">{attendee.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(attendee.status)}`}>
                      {attendee.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {meeting.agenda.length > 0 && (
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">📋 Agenda ({meeting.agenda.length} items):</span>
                <div className="mt-2 space-y-1">
                  {meeting.agenda.slice(0, 3).map((item) => (
                    <div key={item.id} className="text-sm text-gray-600">
                      {item.order}. {item.title} ({item.duration}min)
                      {item.presenter && <span className="text-gray-500"> - {item.presenter}</span>}
                    </div>
                  ))}
                  {meeting.agenda.length > 3 && (
                    <div className="text-sm text-gray-500">
                      ... and {meeting.agenda.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Created: {new Date(meeting.createdAt).toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedMeeting(meeting);
                    setShowDetailsModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View Details
                </button>
                {meeting.status === 'scheduled' && (
                  <>
                    <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                      Edit
                    </button>
                    {meeting.isVirtual && meeting.meetingLink && (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                      >
                        Join Meeting
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto text-black">
            <h3 className="text-lg font-semibold mb-4">Schedule New Meeting</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter meeting title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter meeting description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Type
                  </label>
                  <select
                    value={newMeeting.type}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, type: e.target.value as Meeting['type'] }))}
                    className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Meeting type"
                  >
                    <option value="planning">Planning</option>
                    <option value="progress">Progress</option>
                    <option value="review">Review</option>
                    <option value="coordination">Coordination</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    placeholder='Enter duration in minutes'
                    type="number"
                    value={newMeeting.duration}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    placeholder='Select meeting date'
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    placeholder='Select meeting time'
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={newMeeting.isVirtual}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, isVirtual: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Virtual Meeting</span>
                </label>

                {newMeeting.isVirtual ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={newMeeting.meetingLink}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, meetingLink: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter meeting location"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Teachers
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {teachers.map(teacher => (
                    <label key={teacher.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAttendees.includes(teacher.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAttendees(prev => [...prev, teacher.id]);
                          } else {
                            setSelectedAttendees(prev => prev.filter(id => id !== teacher.id));
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
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMeeting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Details Modal */}
      {showDetailsModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto text-black">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedMeeting.title}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-gray-600">{selectedMeeting.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Date & Time:</span>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedMeeting.date, selectedMeeting.time)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Duration:</span>
                  <p className="text-sm text-gray-900">{selectedMeeting.duration} minutes</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedMeeting.type)}`}>
                    {selectedMeeting.type}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMeeting.status)}`}>
                    {selectedMeeting.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Location:</span>
                <p className="text-sm text-gray-900">
                  {selectedMeeting.isVirtual ? (
                    <span className="text-blue-600">
                      Virtual Meeting
                      {selectedMeeting.meetingLink && (
                        <> - <a href={selectedMeeting.meetingLink} target="_blank" rel="noopener noreferrer" className="underline">Join Link</a></>
                      )}
                    </span>
                  ) : (
                    selectedMeeting.location
                  )}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Attendees:</span>
                <div className="mt-2 space-y-2">
                  {selectedMeeting.attendees.map((attendee) => (
                    <div key={attendee.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="text-sm font-medium">{attendee.name}</span>
                        <span className="text-sm text-gray-500 ml-2">{attendee.email}</span>
                        {attendee.department && <span className="text-sm text-gray-500 ml-2">({attendee.department})</span>}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(attendee.status)}`}>
                        {attendee.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMeeting.agenda.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Agenda:</span>
                  <div className="mt-2 space-y-2">
                    {selectedMeeting.agenda.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-sm font-medium">{item.order}. {item.title}</span>
                            {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                            {item.presenter && <p className="text-sm text-gray-500 mt-1">Presenter: {item.presenter}</p>}
                          </div>
                          <span className="text-sm text-gray-500">{item.duration} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMeeting.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Notes:</span>
                  <p className="text-sm text-gray-900 mt-1">{selectedMeeting.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
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

export default MeetingScheduler;
