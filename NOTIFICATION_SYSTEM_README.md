# Real-Time Notification System with Socket.IO

This document describes the implementation of a real-time notification system using Socket.IO for the Smart Marks application.

## Overview

The notification system provides real-time updates to module leaders when:
- Teachers request course access
- Teachers submit documents
- Course requests are approved/rejected
- Document submissions are approved/rejected

## Architecture

### Backend (Node.js + Express + Socket.IO)

#### Components:
1. **Notification Model** (`Server/src/models/Notification.ts`)
   - MongoDB schema for storing notifications
   - Supports different notification types
   - Includes read/unread status tracking

2. **Notification Controller** (`Server/src/controllers/notificationController.ts`)
   - Handles CRUD operations for notifications
   - Integrates with Socket.IO for real-time delivery
   - Provides pagination and filtering

3. **Socket.IO Server** (`Server/src/socket.ts`)
   - Manages real-time connections
   - Handles user authentication via JWT
   - Supports role-based room management

4. **Module Leader Routes** (`Server/src/routes/moduleLeader.ts`)
   - Handles teacher course requests and document submissions
   - Automatically creates notifications when actions are taken
   - Integrates with the notification system

#### Key Features:
- JWT-based authentication for Socket.IO connections
- Role-based room management (module-leaders, admins)
- Automatic notification creation on status changes
- Real-time notification delivery

### Frontend (React + TypeScript + Socket.IO Client)

#### Components:
1. **Notification Bell** (`Client/src/components/NotificationBell.tsx`)
   - Shows unread notification count
   - Dropdown with notification list
   - Pagination support
   - Mark as read/delete functionality

2. **Socket Hook** (`Client/src/hooks/useSocket.ts`)
   - Manages Socket.IO client connections
   - Handles authentication and reconnection
   - Listens for real-time notifications

3. **Notification API** (`Client/src/redux/api/notificationApi.ts`)
   - RTK Query endpoints for notification operations
   - Integrates with Redux store
   - Handles caching and invalidation

## Installation & Setup

### Backend Dependencies
```bash
cd Server
npm install socket.io @types/socket.io
```

### Frontend Dependencies
```bash
cd Client
npm install socket.io-client
```

### Environment Variables
Create a `.env` file in the Server directory:
```env
JWT_SECRET=your_jwt_secret_here
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Create a `.env` file in the Client directory:
```env
VITE_API_URL=http://localhost:5000
```

## Usage

### Backend Integration

The notification system automatically creates notifications when:

1. **Course Request Status Changes:**
```typescript
// In moduleLeader.ts routes
const notificationData: CreateNotificationData = {
  recipientId: updatedRequest.teacherId._id.toString(),
  senderId: userId,
  type: status === 'approved' ? 'course_approved' : 'course_rejected',
  title: `Course Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
  message: `Your course request for ${courseCode} has been ${status}.`,
  data: { /* relevant data */ }
};

await NotificationController.createAndSendNotification(notificationData);
```

2. **Document Submission Status Changes:**
```typescript
// Similar pattern for document submissions
const notificationData: CreateNotificationData = {
  recipientId: updatedSubmission.teacherId._id.toString(),
  senderId: userId,
  type: status === 'approved' ? 'document_approved' : 'document_rejected',
  title: `Document Submission ${status === 'approved' ? 'Approved' : 'Rejected'}`,
  message: `Your document submission has been ${status}.`,
  data: { /* relevant data */ }
};

await NotificationController.createAndSendNotification(notificationData);
```

### Frontend Integration

1. **Add Notification Bell to Navbar:**
```typescript
import NotificationBell from '../components/NotificationBell';

// In your navbar component
<div className="navbar-end">
  <NotificationBell />
  {/* other navbar items */}
</div>
```

2. **Use Socket Hook in Components:**
```typescript
import { useSocket } from '../hooks/useSocket';

const MyComponent = () => {
  const { isConnected, socket } = useSocket();
  
  // Component logic
  return (
    <div>
      Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
};
```

## API Endpoints

### Notifications
- `GET /api/notifications` - Get user notifications with pagination
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Module Leader
- `GET /api/module-leader/course-requests` - Get course requests
- `PATCH /api/module-leader/course-requests/:id/status` - Update course request status
- `GET /api/module-leader/document-submissions` - Get document submissions
- `PATCH /api/module-leader/document-submissions/:id/status` - Update document submission status

## Socket.IO Events

### Client to Server
- `connect` - Establish connection
- `disconnect` - Handle disconnection
- `join_room` - Join a specific room
- `leave_room` - Leave a specific room

### Server to Client
- `new_notification` - New notification received
- `connect` - Connection established
- `connect_error` - Connection error

## Notification Types

- `course_request` - Teacher requests course access
- `document_submission` - Teacher submits document
- `course_approved` - Course request approved
- `course_rejected` - Course request rejected
- `document_approved` - Document submission approved
- `document_rejected` - Document submission rejected

## Security Features

- JWT-based authentication for all Socket.IO connections
- User-specific rooms to prevent unauthorized access
- Role-based access control for API endpoints
- Input validation and sanitization

## Performance Considerations

- Pagination for notification lists
- Efficient database indexing on recipientId and isRead
- Connection pooling for Socket.IO
- Automatic reconnection handling

## Troubleshooting

### Common Issues:

1. **Socket Connection Fails:**
   - Check JWT token validity
   - Verify CORS configuration
   - Check network connectivity

2. **Notifications Not Received:**
   - Verify user is in correct rooms
   - Check notification creation in database
   - Verify Socket.IO event emission

3. **Performance Issues:**
   - Implement notification pagination
   - Add database indexes
   - Monitor Socket.IO connection count

### Debug Mode:
Enable debug logging by setting environment variable:
```env
DEBUG=socket.io:*
```

## Future Enhancements

- Push notifications for mobile devices
- Email notifications as fallback
- Notification preferences and settings
- Bulk notification operations
- Notification templates and customization
- Analytics and reporting

## Contributing

When adding new notification types:
1. Update the Notification model schema
2. Add new notification creation logic
3. Update frontend notification handling
4. Add appropriate tests
5. Update this documentation

## License

This notification system is part of the Smart Marks application. 