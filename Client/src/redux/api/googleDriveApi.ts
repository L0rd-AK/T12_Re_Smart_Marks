import { baseApi } from './baseApi';

export interface GoogleDriveFileMetadata {
  documentId: string;
  fileName: string;
  fileType: string;
  googleDriveFileId: string;
  googleDriveLink: string;
  uploadedAt: string;
  userId: string;
}

export interface GoogleDriveFileVerification {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
}

export interface GoogleDriveDownloadLinks {
  viewLink?: string;
  downloadLink?: string;
}

export const googleDriveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Store Google Drive file metadata
    storeGoogleDriveFile: builder.mutation<
      { success: boolean; message: string; data: GoogleDriveFileMetadata },
      {
        documentId: string;
        fileName: string;
        fileType: string;
        googleDriveFileId: string;
        googleDriveLink: string;
      }
    >({
      query: (fileData) => ({
        url: '/google-drive/store-file',
        method: 'POST',
        body: fileData,
      }),
      invalidatesTags: ['GoogleDriveFiles'],
    }),

    // Get user's Google Drive files for a specific document
    getUserGoogleDriveFiles: builder.query<
      { success: boolean; data: GoogleDriveFileMetadata[] },
      string
    >({
      query: (documentId) => `/google-drive/files/${documentId}`,
      providesTags: ['GoogleDriveFiles'],
    }),

    // Verify Google Drive file access
    verifyGoogleDriveFile: builder.mutation<
      { success: boolean; message: string; data: GoogleDriveFileVerification },
      { fileId: string; accessToken: string }
    >({
      query: (verificationData) => ({
        url: '/google-drive/verify-file',
        method: 'POST',
        body: verificationData,
      }),
    }),

    // Get Google Drive file download links
    getGoogleDriveDownloadLink: builder.mutation<
      { success: boolean; data: GoogleDriveDownloadLinks },
      { fileId: string; accessToken: string }
    >({
      query: ({ fileId, accessToken }) => ({
        url: `/google-drive/download-link/${fileId}`,
        method: 'POST',
        body: { accessToken },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useStoreGoogleDriveFileMutation,
  useGetUserGoogleDriveFilesQuery,
  useVerifyGoogleDriveFileMutation,
  useGetGoogleDriveDownloadLinkMutation,
} = googleDriveApi;
