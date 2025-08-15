# Teacher Requests API

This API handles teacher course access requests and document submission requests for module leaders.

## Base URL
`/api/teacher-requests`

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header.

## Endpoints

### Course Requests

#### GET `/module-leader/course-requests`
Get all course access requests for the authenticated module leader.

**Required Role:** `module-leader`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "request_id",
      "teacherId": "teacher_user_id",
      "teacherName": "Teacher Name",
      "teacherEmail": "teacher@email.com",
      "employeeId": "EMP001",
      "courseId": "course_id",
      "courseCode": "CS101",
      "courseTitle": "Introduction to Computer Science",
      "semester": "Fall 2024",
      "batch": "Fall 2024",
      "department": "Computer Science",
      "reason": "Request message from teacher",
      "status": "pending",
      "requestedAt": "2024-01-01T00:00:00.000Z",
      "reviewedBy": null,
      "reviewedAt": null,
      "reviewComments": null
    }
  ]
}
```

#### PATCH `/module-leader/course-requests/:requestId/status`
Update the status of a course access request.

**Required Role:** `module-leader`

**Parameters:**
- `requestId`: MongoDB ObjectId of the request

**Request Body:**
```json
{
  "status": "approved" | "rejected",
  "reviewComments": "Optional review comments"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "data": { /* updated request object */ }
}
```

### Document Submissions

#### GET `/module-leader/document-submissions`
Get all document submissions for courses managed by the authenticated module leader.

**Required Role:** `module-leader`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "submission_id",
      "submissionId": "submission_id",
      "teacherId": "teacher_user_id",
      "teacherName": "Teacher Name",
      "teacherEmail": "teacher@email.com",
      "employeeId": "EMP001",
      "courseCode": "CS101",
      "courseTitle": "Introduction to Computer Science",
      "semester": "Fall 2024",
      "batch": "Fall 2024",
      "department": "Computer Science",
      "submissionStatus": "complete",
      "overallStatus": "pending",
      "completionPercentage": 100,
      "submittedAt": "2024-01-01T00:00:00.000Z",
      "lastModifiedAt": "2024-01-01T00:00:00.000Z",
      "reviewComments": null,
      "reviewedBy": null,
      "reviewedAt": null
    }
  ]
}
```

#### PATCH `/module-leader/document-submissions/:submissionId/status`
Update the review status of a document submission.

**Required Role:** `module-leader`

**Parameters:**
- `submissionId`: MongoDB ObjectId of the submission

**Request Body:**
```json
{
  "status": "approved" | "rejected",
  "reviewComments": "Optional review comments"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Document submission approved successfully",
  "data": { /* updated submission object */ }
}
```

## Data Flow

1. **Course Access Requests**: Teachers submit requests through the course access API, which are then managed by module leaders through these endpoints.

2. **Document Submissions**: Teachers submit documents through the document submission API, which are then reviewed by module leaders through these endpoints.

3. **Authorization**: All endpoints verify that the authenticated user is a module leader and has authority over the requested course/submission.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

Error responses include:
```json
{
  "success": false,
  "message": "Error description"
}
```
