import { baseApi } from './baseApi';

// Types
export interface FileMetadata {
  originalName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  googleDriveId: string;
  liveViewLink: string;
  downloadLink: string;
  thumbnailLink?: string;
  uploadedAt: string;
  lastModified: string;
  checksum?: string;
}

export interface PermissionSettings {
  teachers: {
    canView: boolean;
    canDownload: boolean;
    canComment: boolean;
    canEdit: boolean;
    specificTeachers?: string[];
  };
  students: {
    canView: boolean;
    canDownload: boolean;
    canComment: boolean;
    canEdit: boolean;
    specificBatches?: string[];
    specificSections?: string[];
  };
  public: {
    canView: boolean;
    canDownload: boolean;
    canComment: boolean;
    canEdit: boolean;
  };
}

export interface DistributionStatus {
  status: 'pending' | 'distributed' | 'archived' | 'expired';
  distributedAt?: string;
  archivedAt?: string;
  expiresAt?: string;
  distributionNotes?: string;
  archivedBy?: string;
  archiveReason?: string;
}

export interface AccessTracking {
  totalViews: number;
  totalDownloads: number;
  uniqueViewers: string[];
  uniqueDownloaders: string[];
  lastAccessedAt?: string;
  accessLog: Array<{
    userId: string;
    action: 'view' | 'download' | 'comment' | 'edit';
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
  }>;
}

export interface DocumentDistribution {
  _id: string;
  distributionId: string;
  title: string;
  description?: string;
  category: 'lecture-notes' | 'assignments' | 'syllabus' | 'reading-material' | 'exams' | 'templates' | 'other';
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  files: FileMetadata[];
  totalFileSize: number;
  fileCount: number;
  googleDriveFolderId: string;
  googleDriveFolderPath: string;
  folderStructure: {
    year: string;
    semester: string;
    batch: string;
    courseCode: string;
    courseName: string;
    department: string;
    subFolder?: string;
  };
  course: {
    courseId: string;
    courseCode: string;
    courseName: string;
    creditHours: number;
    department: string;
    departmentName: string;
  };
  academicInfo: {
    academicYear: string;
    semester: string;
    batch: string;
    section?: string;
    classCount?: number;
  };
  moduleLeader: {
    userId: string;
    name: string;
    email: string;
    employeeId: string;
    department: string;
  };
  permissions: PermissionSettings;
  distributionStatus: DistributionStatus;
  accessTracking: AccessTracking;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  version: number;
  previousVersions?: string[];
  auditTrail: Array<{
    action: 'created' | 'updated' | 'distributed' | 'archived' | 'permission-changed' | 'file-added' | 'file-removed';
    timestamp: string;
    userId: string;
    userName: string;
    details: string;
    previousState?: any;
  }>;
  teacherPermissions?: {
    canView: boolean;
    canDownload: boolean;
    canComment: boolean;
    canEdit: boolean;
  };
}

export interface CreateDocumentDistributionRequest {
  title: string;
  description?: string;
  category: DocumentDistribution['category'];
  tags?: string[];
  priority?: DocumentDistribution['priority'];
  courseId: string;
  academicYear: string;
  semester: string;
  batch: string;
  section?: string;
  classCount?: number;
  permissions?: PermissionSettings;
}

export interface UpdateDocumentDistributionRequest {
  title?: string;
  description?: string;
  category?: DocumentDistribution['category'];
  tags?: string[];
  priority?: DocumentDistribution['priority'];
  permissions?: PermissionSettings;
}

export interface UpdateStatusRequest {
  status: DistributionStatus['status'];
  notes?: string;
  reason?: string;
}

export interface UploadFilesRequest {
  files: File[];
}

export interface GetDistributionsQuery {
  page?: number;
  limit?: number;
  category?: string;
  courseCode?: string;
  department?: string;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DistributionsResponse {
  success: boolean;
  data: DocumentDistribution[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DistributionResponse {
  success: boolean;
  data: DocumentDistribution;
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    totalViews: number;
    totalDownloads: number;
    uniqueViewers: number;
    uniqueDownloaders: number;
    lastAccessed?: string;
    fileCount: number;
    totalSize: number;
    status: string;
    createdAt: string;
    lastModified: string;
  };
}

// API
export const documentDistributionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create new document distribution
    createDocumentDistribution: builder.mutation<DistributionResponse, CreateDocumentDistributionRequest>({
      query: (data) => ({
        url: '/document-distribution',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DocumentDistribution'],
    }),

    // Get all document distributions
    getDocumentDistributions: builder.query<DistributionsResponse, GetDistributionsQuery>({
      query: (params) => ({
        url: '/document-distribution',
        params,
      }),
      providesTags: ['DocumentDistribution'],
    }),

    // Get specific document distribution
    getDocumentDistribution: builder.query<DistributionResponse, string>({
      query: (distributionId) => `/document-distribution/${distributionId}`,
      providesTags: (_, __, distributionId) => [
        { type: 'DocumentDistribution', id: distributionId },
      ],
    }),

    // Update document distribution
    updateDocumentDistribution: builder.mutation<DistributionResponse, { distributionId: string; data: UpdateDocumentDistributionRequest }>({
      query: ({ distributionId, data }) => ({
        url: `/document-distribution/${distributionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { distributionId }) => [
        { type: 'DocumentDistribution', id: distributionId },
        'DocumentDistribution',
      ],
    }),

    // Update distribution status
    updateDistributionStatus: builder.mutation<DistributionResponse, { distributionId: string; data: UpdateStatusRequest }>({
      query: ({ distributionId, data }) => ({
        url: `/document-distribution/${distributionId}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { distributionId }) => [
        { type: 'DocumentDistribution', id: distributionId },
        'DocumentDistribution',
      ],
    }),

    // Upload files to distribution
    uploadFilesToDistribution: builder.mutation<{ success: boolean; message: string; data: any }, { distributionId: string; data: UploadFilesRequest }>({
      query: ({ distributionId, data }) => {
        const formData = new FormData();
        data.files.forEach((file) => {
          formData.append('files', file);
        });

        return {
          url: `/document-distribution/${distributionId}/files`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (_, __, { distributionId }) => [
        { type: 'DocumentDistribution', id: distributionId },
        'DocumentDistribution',
      ],
    }),

    // Get distribution analytics
    getDistributionAnalytics: builder.query<AnalyticsResponse, string>({
      query: (distributionId) => `/document-distribution/${distributionId}/analytics`,
      providesTags: (_, __, distributionId) => [
        { type: 'DocumentDistribution', id: distributionId },
      ],
    }),

    // Delete/Archive document distribution
    deleteDocumentDistribution: builder.mutation<{ success: boolean; message: string }, string>({
      query: (distributionId) => ({
        url: `/document-distribution/${distributionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DocumentDistribution'],
    }),

    // Get shared documents for teachers
    getSharedDocuments: builder.query<DistributionsResponse, void>({
      query: () => '/document-distribution/shared/teacher',
      providesTags: ['DocumentDistribution'],
    }),

    // Get shared documents for a specific course (for teachers)
    getCourseSharedDocuments: builder.query<DistributionsResponse, string>({
      query: (courseId) => `/document-distribution/shared/course/${courseId}`,
      providesTags: ['DocumentDistribution'],
    }),

    // Get document distributions for a specific course (for module leaders)
    getCourseDocumentDistributions: builder.query<DistributionsResponse, string>({
      query: (courseId) => `/document-distribution/course/${courseId}`,
      providesTags: ['DocumentDistribution'],
    }),
  }),
});

// Export hooks
export const {
  useCreateDocumentDistributionMutation,
  useGetDocumentDistributionsQuery,
  useGetDocumentDistributionQuery,
  useUpdateDocumentDistributionMutation,
  useUpdateDistributionStatusMutation,
  useUploadFilesToDistributionMutation,
  useGetDistributionAnalyticsQuery,
  useDeleteDocumentDistributionMutation,
  useGetSharedDocumentsQuery,
  useGetCourseSharedDocumentsQuery,
  useGetCourseDocumentDistributionsQuery,
} = documentDistributionApi;
