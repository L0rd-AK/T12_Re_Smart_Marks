// Common types for Module Leader Dashboard components

export interface ModuleStats {
  totalTeachers: number;
  activeTeachers: number;
  totalSections: number;
  totalStudents: number;
  documentsSubmitted: number;
  pendingSubmissions: number;
  upcomingMeetings: number;
  recentMessages: number;
}

export interface RecentActivity {
  id: string;
  type: 'submission' | 'message' | 'meeting' | 'document';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface Teacher {
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

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  hoverColor: string;
  onClick: () => void;
}

// Props interfaces
export interface ModulePerformanceProps {
  averageSubmissionRate: number;
  averageResponseRate: number;
  completionRate: number;
  activeTeachersRate: number;
}

export interface QuickActionsProps {
  onSendAnnouncement?: () => void;
  onScheduleMeeting?: () => void;
  onCreateTemplate?: () => void;
  onViewReports?: () => void;
}

export interface RecentActivitiesProps {
  activities?: RecentActivity[];
  maxActivities?: number;
  onViewAll?: () => void;
}

export interface TeacherStatusProps {
  teachers?: Teacher[];
  maxTeachers?: number;
  onViewAll?: () => void;
  onTeacherClick?: (teacher: Teacher) => void;
}
