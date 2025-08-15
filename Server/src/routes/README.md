# API Routes Documentation

This document provides an overview of all available API routes in the Smart Marks application.

## Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /verify-email` - Verify email address
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile

## Marks Routes (`/api/marks`)
- `GET /` - Get marks for courses
- `POST /` - Create new marks entry
- `PUT /:id` - Update marks entry
- `DELETE /:id` - Delete marks entry
- `GET /course/:courseId` - Get marks for specific course
- `GET /student/:studentId` - Get marks for specific student

## Google Drive Routes (`/api/google-drive`)
- `GET /auth` - Initialize Google Drive authentication
- `POST /upload` - Upload file to Google Drive
- `GET /files` - List files from Google Drive
- `DELETE /files/:fileId` - Delete file from Google Drive
- `GET /folders` - List folders from Google Drive
- `POST /folders` - Create folder in Google Drive

## Admin Routes (`/api/admin`)
- `GET /users` - Get all users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /departments` - Get all departments
- `POST /departments` - Create new department
- `PUT /departments/:id` - Update department
- `DELETE /departments/:id` - Delete department
- `GET /courses` - Get all courses
- `POST /courses` - Create new course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `GET /sections` - Get all sections
- `POST /sections` - Create new section
- `PUT /sections/:id` - Update section
- `DELETE /sections/:id` - Delete section
- `GET /batches` - Get all batches
- `POST /batches` - Create new batch
- `PUT /batches/:id` - Update batch
- `DELETE /batches/:id` - Delete batch

## Document Routes (`/api/documents`)
- `GET /` - Get all documents
- `POST /` - Create new document
- `GET /:id` - Get document by ID
- `PUT /:id` - Update document
- `DELETE /:id` - Delete document
- `GET /course/:courseId` - Get documents for specific course

## Templates Routes (`/api/templates`)
- `GET /` - Get all templates
- `POST /` - Create new template
- `GET /:id` - Get template by ID
- `PUT /:id` - Update template
- `DELETE /:id` - Delete template
- `GET /course/:courseId` - Get templates for specific course

## Course Access Routes (`/api/course-access`)
- `GET /` - Get course access for current user
- `POST /request` - Request course access
- `PUT /request/:id` - Update course access request
- `DELETE /request/:id` - Delete course access request
- `GET /admin` - Get all course access requests (admin only)
- `PUT /admin/:id` - Approve/reject course access request (admin only)

## Teacher Requests Routes (`/api/teacher-requests`)
- `GET /` - Get teacher requests for current user
- `POST /` - Create new teacher request
- `GET /:id` - Get teacher request by ID
- `PUT /:id` - Update teacher request
- `DELETE /:id` - Delete teacher request
- `GET /admin` - Get all teacher requests (admin only)
- `PUT /admin/:id` - Approve/reject teacher request (admin only)

## Courses Routes (`/api/courses`)
- `GET /` - Get all courses
- `GET /:id` - Get course by ID
- `GET /department/:departmentId` - Get courses by department
- `GET /module-leader/:userId` - Get courses by module leader

## Document Distribution Routes (`/api/document-distribution`)
**New comprehensive document distribution system for module leaders**

### Overview
The Document Distribution system provides a complete solution for module leaders to:
- Create and manage document distributions
- Upload files to Google Drive with automatic metadata tracking
- Control access permissions for teachers and students
- Track document usage and analytics
- Maintain audit trails for compliance

### Endpoints

#### Create Document Distribution
- `POST /` - Create new document distribution
  - **Access**: Module Leaders only
  - **Body**: 
    ```json
    {
      "title": "string",
      "description": "string",
      "category": "lecture-notes|assignments|syllabus|reading-material|exams|templates|other",
      "tags": ["string"],
      "priority": "low|medium|high|urgent",
      "courseId": "string",
      "academicYear": "string",
      "semester": "string",
      "batch": "string",
      "section": "string",
      "classCount": "number",
      "permissions": {
        "teachers": {
          "canView": "boolean",
          "canDownload": "boolean",
          "canComment": "boolean",
          "canEdit": "boolean"
        },
        "students": {
          "canView": "boolean",
          "canDownload": "boolean",
          "canComment": "boolean",
          "canEdit": "boolean"
        },
        "public": {
          "canView": "boolean",
          "canDownload": "boolean",
          "canComment": "boolean",
          "canEdit": "boolean"
        }
      }
    }
    ```

#### Upload Files
- `POST /:distributionId/files` - Upload files to existing distribution
  - **Access**: Module Leaders only
  - **Body**: FormData with files
  - **Features**: 
    - Automatic Google Drive upload
    - Metadata extraction and storage
    - Live view and download link generation

#### Retrieve Distributions
- `GET /` - Get all document distributions with filtering and pagination
  - **Query Parameters**:
    - `page`: Page number (default: 1)
    - `limit`: Items per page (default: 10)
    - `category`: Filter by document category
    - `courseCode`: Filter by course code
    - `department`: Filter by department
    - `status`: Filter by distribution status
    - `priority`: Filter by priority level
    - `search`: Search in title, description, tags, course name
    - `sortBy`: Sort field (default: createdAt)
    - `sortOrder`: Sort direction (asc|desc, default: desc)
  - **Features**:
    - Role-based access control
    - Intelligent filtering
    - Pagination support
    - Search functionality

#### Get Specific Distribution
- `GET /:distributionId` - Get document distribution by ID
  - **Features**:
    - Access permission validation
    - Automatic access tracking
    - Complete file metadata
    - Permission details

#### Update Distribution
- `PUT /:distributionId` - Update document distribution
  - **Access**: Module Leaders only
  - **Features**:
    - Audit trail maintenance
    - Version control
    - Permission updates

#### Update Status
- `PATCH /:distributionId/status` - Update distribution status
  - **Access**: Module Leaders only
  - **Body**:
    ```json
    {
      "status": "pending|distributed|archived|expired",
      "notes": "string",
      "reason": "string"
    }
    ```

#### Analytics
- `GET /:distributionId/analytics` - Get distribution analytics
  - **Access**: Module Leaders only
  - **Data**:
    - Total views and downloads
    - Unique viewers and downloaders
    - Access patterns
    - File statistics

#### Archive Distribution
- `DELETE /:distributionId` - Archive document distribution
  - **Access**: Module Leaders only
  - **Features**:
    - Soft delete (archiving)
    - Audit trail maintenance
    - Reason tracking

### Features

#### 1. Document Metadata Tracking
- **Unique identifiers** for each distribution
- **File information**: name, type, size, MIME type
- **Upload timestamps** and modification tracking
- **Google Drive integration** with file IDs and links

#### 2. Google Drive Integration
- **Automatic folder creation** with structured hierarchy
- **Live view links** for immediate access
- **Download links** for file retrieval
- **Thumbnail generation** for visual previews

#### 3. Academic Context
- **Course information** (code, name, credit hours)
- **Academic year and semester** tracking
- **Batch and section** management
- **Department details** for organization

#### 4. Access Control
- **Granular permissions** for teachers, students, and public
- **Role-based access** with specific restrictions
- **Batch and section** specific access control
- **Permission inheritance** and overrides

#### 5. Real-time Updates
- **Automatic collection updates** on file uploads
- **Status synchronization** with Google Drive
- **Audit trail** for all operations
- **Version control** for document lifecycle

#### 6. Analytics and Tracking
- **View and download** statistics
- **Unique user tracking** for insights
- **Access log** with timestamps and user agents
- **Performance metrics** for optimization

### Database Schema

The system uses a comprehensive MongoDB schema with:
- **Indexed fields** for efficient querying
- **Embedded documents** for related data
- **Array fields** for tags and file lists
- **Reference fields** for user and course relationships

### Security Features

- **JWT authentication** for all endpoints
- **Role-based access control** (RBAC)
- **Permission validation** on every request
- **Audit logging** for compliance
- **Input validation** and sanitization

### Integration Points

- **Google Drive API** for file storage
- **User management** system for authentication
- **Course management** for academic context
- **Department system** for organizational structure

This system provides a robust foundation for academic document management with enterprise-grade features for security, scalability, and compliance.
