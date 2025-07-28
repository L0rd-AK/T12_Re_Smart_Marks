# Module Leader Dashboard Components

This directory contains functionalized components for the Module Leader Dashboard, each responsible for a specific section of the dashboard.

## Components

### 1. ModulePerformance
Displays module performance metrics including submission rates, response rates, and overall health indicators.

**Props:**
- `averageSubmissionRate: number` - Average submission rate percentage
- `averageResponseRate: number` - Average response rate percentage  
- `completionRate: number` - Task completion rate percentage
- `activeTeachersRate: number` - Active teachers percentage

**Usage:**
```tsx
<ModulePerformance
  averageSubmissionRate={85}
  averageResponseRate={92}
  completionRate={78}
  activeTeachersRate={95}
/>
```

### 2. QuickActions
Provides quick action buttons for common module leader tasks.

**Props:**
- `onSendAnnouncement?: () => void` - Handler for send announcement action
- `onScheduleMeeting?: () => void` - Handler for schedule meeting action
- `onCreateTemplate?: () => void` - Handler for create template action
- `onViewReports?: () => void` - Handler for view reports action

**Usage:**
```tsx
<QuickActions
  onSendAnnouncement={() => console.log('Send announcement')}
  onScheduleMeeting={() => console.log('Schedule meeting')}
  onCreateTemplate={() => console.log('Create template')}
  onViewReports={() => console.log('View reports')}
/>
```

### 3. RecentActivities
Shows a list of recent activities with filtering and pagination options.

**Props:**
- `activities?: RecentActivity[]` - Array of activities (uses default data if not provided)
- `maxActivities?: number` - Maximum number of activities to display (default: 5)
- `onViewAll?: () => void` - Handler for view all activities action

**Usage:**
```tsx
<RecentActivities
  activities={activityData}
  maxActivities={5}
  onViewAll={() => console.log('View all activities')}
/>
```

### 4. TeacherStatus
Displays teacher status information including performance metrics and login status.

**Props:**
- `teachers?: Teacher[]` - Array of teachers (uses default data if not provided)
- `maxTeachers?: number` - Maximum number of teachers to display (default: 4)
- `onViewAll?: () => void` - Handler for view all teachers action
- `onTeacherClick?: (teacher: Teacher) => void` - Handler for teacher selection

**Usage:**
```tsx
<TeacherStatus
  teachers={teacherData}
  maxTeachers={4}
  onViewAll={() => console.log('View all teachers')}
  onTeacherClick={(teacher) => console.log('Teacher clicked:', teacher.name)}
/>
```

## Types

All components use shared TypeScript types defined in `types.ts`:

- `ModuleStats` - Statistics interface for module data
- `RecentActivity` - Interface for activity items
- `Teacher` - Interface for teacher data
- `QuickAction` - Interface for quick action items
- Component-specific props interfaces

## Integration

The components are designed to work together in the ModuleOverview component:

```tsx
import { 
  ModulePerformance, 
  QuickActions, 
  RecentActivities, 
  TeacherStatus 
} from './components';

// Use in layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <ModulePerformance {...performanceProps} />
  <QuickActions {...actionProps} />
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <RecentActivities {...activityProps} />
  <TeacherStatus {...teacherProps} />
</div>
```

## Features

### ModulePerformance
- Dynamic progress bars with color coding
- Performance thresholds (90%+ green, 75%+ yellow, <75% red)
- Overall module health calculation
- Responsive design

### QuickActions
- Icon-based action buttons
- Hover effects and transitions
- Accessibility support (ARIA labels)
- Customizable action handlers

### RecentActivities
- Real-time activity feed
- Activity type categorization
- Status and priority indicators
- Relative time formatting
- Activity summary statistics

### TeacherStatus
- Online status indicators
- Performance metrics visualization
- Teacher profile initials
- Performance alerts
- Sorting and filtering capabilities

## Styling

All components use Tailwind CSS for styling and are designed to:
- Be fully responsive
- Follow consistent design patterns
- Support dark/light themes
- Maintain accessibility standards
- Use smooth transitions and animations

## Accessibility

Components include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly content
- Color contrast compliance
- Focus management
