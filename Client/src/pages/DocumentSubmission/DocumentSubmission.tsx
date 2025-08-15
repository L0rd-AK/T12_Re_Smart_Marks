import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    useGetCurrentOrCreateSubmissionQuery,
    useUpdateDocumentStatusMutation,
    useSubmitDocumentSubmissionMutation
} from '../../redux/api/documentApi';
import toast from 'react-hot-toast';
import { toast as sonnerToast } from 'sonner';
import GoogleDriveConnection from '../../components/GoogleDriveConnection';
import SharedDriveStatus from '../../components/SharedDriveStatus';
import PDFGenerator from '../../components/PDFGenerator';
import { GoogleDriveService } from '../../services/googleDriveService';
import { SharedDriveService } from '../../services/sharedDriveService';
import { useGetCurrentUserQuery } from '../../redux/api/authApi';
import { useAppSelector } from '../../redux/hooks';
import SectionInformation from '../../components/SectionInformation';
import LoadingSpinner from '../../components/LoadingSpinner';


interface CourseInfo {
    semester: string;
    courseCode: string;
    courseTitle: string;
    creditHours: string;
    courseSection: string;
    classCount: string;
}

interface TeacherInfo {
    teacherName: string;
    employeeId: string;
    designation: string;
    emailId: string;
    mobileNumber: string;
}

interface DocumentItem {
    id: string;
    name: string;
    category: 'theory' | 'lab';
    fileTypes: string[]; // Array of required file types for this document
    files?: Record<string, File>; // Dynamic files object
    uploadedFiles?: Record<string, { name: string; size: number; type: string; lastModified: number }>; // Metadata of uploaded files
    status: 'yes' | 'no' | 'pending';
}

const DocumentSubmission: React.FC = () => {
    const [updateDocumentStatus] = useUpdateDocumentStatusMutation();
    const [submitDocumentSubmission] = useSubmitDocumentSubmissionMutation();
    const [theoryFolderId, setTheoryFolderId] = useState<string | null>(null);
    const [labFolderId, setLabFolderId] = useState<string | null>(null);

    // Track upload results for dual drive system
    const [uploadResults, setUploadResults] = useState<{
        personal: boolean;
        shared: boolean;
        errors: string[];
    }[]>([]);

    // Initialize documents with database data if available
    const getInitialDocuments = () => {
        const defaultTheoryDocuments: DocumentItem[] = [
            {
                id: 'course-outline',
                name: 'Course Outline (.doc Format)',
                category: 'theory',
                fileTypes: ['doc'],
                status: 'pending'
            },
            {
                id: 'class-test',
                name: 'Class Test (Marginal, Average, Excellent Script) with Question',
                category: 'theory',
                fileTypes: ['marginal', 'average', 'excellent', 'question'],
                status: 'pending'
            },
            {
                id: 'attendance',
                name: 'Attendance (Class, Midterm Exam, Final Exam) pdf File',
                category: 'theory',
                fileTypes: ['class-attendance', 'midterm-attendance', 'final-attendance'],
                status: 'pending'
            },
            {
                id: 'assignment',
                name: 'Assignment (Marginal, Average, Excellent Script)',
                category: 'theory',
                fileTypes: ['marginal', 'average', 'excellent'],
                status: 'pending'
            },
            {
                id: 'assignment-marks',
                name: 'Assignment & Presentation Marks Sheet on Rubrics (pdf)',
                category: 'theory',
                fileTypes: ['assignment-marks', 'presentation-marks'],
                status: 'pending'
            },
            {
                id: 'midterm-script',
                name: 'Midterm Exam Script (Marginal, Average, Excellent Script)',
                category: 'theory',
                fileTypes: ['marginal', 'average', 'excellent'],
                status: 'pending'
            },
            {
                id: 'final-script',
                name: 'Final Exam (Marginal, Average, Excellent Script)',
                category: 'theory',
                fileTypes: ['marginal', 'average', 'excellent'],
                status: 'pending'
            },
            {
                id: 'final-tabulation',
                name: 'Final Tabulation Sheet (pdf Format)',
                category: 'theory',
                fileTypes: ['tabulation'],
                status: 'pending'
            },
            {
                id: 'section-wise-co',
                name: 'Section Wise CO – PO Mapping File',
                category: 'theory',
                fileTypes: ['co-po-mapping'],
                status: 'pending'
            },
            {
                id: 'course-end-report',
                name: 'Course End Report duly signed by Section Teacher (pdf Format)',
                category: 'theory',
                fileTypes: ['course-end-report'],
                status: 'pending'
            },
        ];

        const defaultLabDocuments: DocumentItem[] = [
            {
                id: 'lab-report',
                name: 'Lab Report',
                category: 'lab',
                fileTypes: ['lab-report'],
                status: 'pending'
            },
            {
                id: 'lab-performance',
                name: 'Lab Performance, Lab Final, Project (pdf)',
                category: 'lab',
                fileTypes: ['lab-performance', 'lab-final', 'project'],
                status: 'pending'
            },
            {
                id: 'lab-project',
                name: 'Lab with Project (Marginal, Average, Excellent Report)',
                category: 'lab',
                fileTypes: ['marginal', 'average', 'excellent'],
                status: 'pending'
            },
            {
                id: 'projects-experiments',
                name: 'List of Projects and Experiments & signature (pdf)',
                category: 'lab',
                fileTypes: ['projects-list', 'experiments-list'],
                status: 'pending'
            },
            {
                id: 'class-attendance',
                name: 'Class Attendance pdf File',
                category: 'lab',
                fileTypes: ['attendance'],
                status: 'pending'
            },
            {
                id: 'section-wise-co-lab',
                name: 'Section Wise CO – PO Mapping File',
                category: 'lab',
                fileTypes: ['co-po-mapping'],
                status: 'pending'
            },
            {
                id: 'final-tabulation-lab',
                name: 'Final Tabulation Sheet (pdf Format)',
                category: 'lab',
                fileTypes: ['tabulation'],
                status: 'pending'
            },
            {
                id: 'course-end-report-lab',
                name: 'Course End Report duly signed by Section Teacher (pdf Format)',
                category: 'lab',
                fileTypes: ['course-end-report'],
                status: 'pending'
            },
        ];

        return {
            theory: defaultTheoryDocuments,
            lab: defaultLabDocuments
        };
    };

    const initialDocuments = useMemo(() => getInitialDocuments(), []);
    const { isSubmitted, courseCode, courseTitle, section, semester, year, courseCredit, noOfClassConducted, batch, department } = useAppSelector((state) => state.sectionInformation);

    // Get current submission from database
    const submissionParams = courseCode && section && semester && year ? {
        courseCode,
        courseSection: section,
        semester: `${semester}-${year}`,
        courseTitle: courseTitle || 'Course Title Not Available',
        creditHours: courseCredit || '3',
        classCount: noOfClassConducted || '0',
        batch: batch || 'Not Specified',
        department: department || 'Not Specified'
    } : null;

    const { data: currentSubmission, isLoading: submissionLoading, refetch: refetchSubmission } = useGetCurrentOrCreateSubmissionQuery(
        submissionParams!,
        {
            skip: !submissionParams
        }
    );
    const courseInfo: CourseInfo = {
        semester: semester + '-' + year || '',
        courseCode: courseCode || '',
        courseTitle: courseTitle || '',
        courseSection: section || '',
        creditHours: courseCredit || '',
        classCount: noOfClassConducted || '',
    };
    const { data: userResponse, isLoading } = useGetCurrentUserQuery();
    const user = userResponse?.user;
    const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
        teacherName: user?.name || '',
        employeeId: user?.employeeId || '',
        designation: user?.designation || '',
        emailId: user?.emailId || user?.email || '',
        mobileNumber: user?.mobileNumber || '',
    });
    useEffect(() => {
        setTeacherInfo({
            teacherName: user?.name || '',
            employeeId: user?.employeeId || '',
            designation: user?.designation || '',
            emailId: user?.emailId || user?.email || '',
            mobileNumber: user?.mobileNumber || '',
        })
    }, [isLoading, user])

    const [theoryDocuments, setTheoryDocuments] = useState<DocumentItem[]>([]);
    const [labDocuments, setLabDocuments] = useState<DocumentItem[]>([]);
    const [isSyncingDocuments, setIsSyncingDocuments] = useState(false);
    const documentsInitialized = useRef(false);
    const isSubmittingRef = useRef(false); // Track submission state
    const lastSubmissionStatusRef = useRef<string>(''); // Track last known submission status
    const preservedDocumentsRef = useRef<{ theory: DocumentItem[], lab: DocumentItem[] } | null>(null); // Preserve documents when submitted

    // Update documents when submission data changes or initial documents change
    useEffect(() => {
        const getDocsFromSubmission = (): { theory: DocumentItem[], lab: DocumentItem[] } => {
            if (!currentSubmission?.data) {
                return initialDocuments;
            }

            const submission = currentSubmission.data;
            const submissionDocs = submission.documents;

            const theory = initialDocuments.theory.map(doc => {
                const submissionDoc = submissionDocs.theory.find(d => d.id === doc.id);
                return {
                    ...doc,
                    status: submissionDoc?.status || 'pending',
                    uploadedFiles: submissionDoc?.uploadedFiles || {}
                };
            });

            const lab = initialDocuments.lab.map(doc => {
                const submissionDoc = submissionDocs.lab.find(d => d.id === doc.id);
                return {
                    ...doc,
                    status: submissionDoc?.status || 'pending',
                    uploadedFiles: submissionDoc?.uploadedFiles || {}
                };
            });

            return { theory, lab };
        };

        const currentStatus = currentSubmission?.data?.submissionStatus || '';
        const statusChanged = lastSubmissionStatusRef.current !== currentStatus;
        const justSubmitted = statusChanged && currentStatus === 'submitted';
        lastSubmissionStatusRef.current = currentStatus;

        // If documents just got submitted, preserve the current state
        if (justSubmitted && !preservedDocumentsRef.current) {
            console.log('💾 Preserving document state after submission');
            preservedDocumentsRef.current = {
                theory: theoryDocuments.length > 0 ? [...theoryDocuments] : [],
                lab: labDocuments.length > 0 ? [...labDocuments] : []
            };
        }

        // If submission is complete and we have preserved documents, use them
        if (currentStatus === 'submitted' && preservedDocumentsRef.current &&
            (preservedDocumentsRef.current.theory.length > 0 || preservedDocumentsRef.current.lab.length > 0)) {
            console.log('🔄 Using preserved document state');
            setTheoryDocuments(preservedDocumentsRef.current.theory);
            setLabDocuments(preservedDocumentsRef.current.lab);
            return; // Early return to prevent any other document updates
        }

        // Prevent document updates if we're currently submitting or already submitted
        if (isSubmittingRef.current || currentStatus === 'submitted') {
            console.log('🚫 Prevented document update - submission in progress or completed');
            return;
        }

        // Only update documents if this is the first load or documents are empty
        const shouldUpdateDocuments = !documentsInitialized.current ||
            (theoryDocuments.length === 0 && labDocuments.length === 0);

        if (shouldUpdateDocuments) {
            console.log('📋 Updating documents from submission data');
            const updatedDocs = getDocsFromSubmission();
            setTheoryDocuments(updatedDocs.theory);
            setLabDocuments(updatedDocs.lab);
            documentsInitialized.current = true;
        }

        // Update folder IDs from submission (this is safe to always update)
        if (currentSubmission?.data?.googleDriveFolders) {
            setTheoryFolderId(currentSubmission.data.googleDriveFolders.theoryFolderId || null);
            setLabFolderId(currentSubmission.data.googleDriveFolders.labFolderId || null);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSubmission, initialDocuments]);

    // Separate effect to preserve documents when they're completed and about to be submitted
    useEffect(() => {
        const currentStatus = currentSubmission?.data?.submissionStatus || '';

        // Preserve current document state when all documents are completed (before submission)
        const allCompleted = theoryDocuments.every(doc => doc.status === 'yes') &&
            labDocuments.every(doc => doc.status === 'yes') &&
            theoryDocuments.length > 0 && labDocuments.length > 0;

        if (allCompleted && currentStatus !== 'submitted' && !preservedDocumentsRef.current) {
            console.log('💾 Pre-preserving document state (all documents completed)');
            preservedDocumentsRef.current = {
                theory: [...theoryDocuments],
                lab: [...labDocuments]
            };
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSubmission?.data?.submissionStatus]);

    // If course information is not available, show the section information form
    if (!submissionParams) {
        return (
            <div className="min-h-screen bg-white py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            OBE File Submission System
                        </h1>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                            <div className="text-blue-600 mb-4 text-center">
                                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-blue-800 mb-2 text-center">Course Setup Required</h3>
                            <p className="text-blue-700 text-center mb-6">
                                Please provide your course information below to continue with document submission.
                            </p>
                        </div>
                        <SectionInformation from={"file-submission"} />
                    </div>
                </div>
            </div>
        );
    }

    // Save to database instead of localStorage when documents change
    const updateDocumentInDatabase = async (
        documentId: string,
        category: 'theory' | 'lab',
        status: 'yes' | 'no' | 'pending',
        uploadedFiles?: Record<string, { name: string; size: number; type: string; lastModified: number; googleDriveId?: string; url?: string }>
    ) => {
        if (!submissionParams) {
            return;
        }

        try {
            console.log('🔄 Updating document status in database:', {
                submissionId: currentSubmission?.data._id,
                documentId,
                category,
                status,
                hasUploadedFiles: !!uploadedFiles
            });

            const result = await updateDocumentStatus({
                submissionId: currentSubmission?.data._id || '',
                documentId,
                category,
                status,
                uploadedFiles
            }).unwrap();

            console.log('✅ Document status updated, new completion:', result.data.completionPercentage);

            // Refetch submission to get updated data
            await refetchSubmission();
            console.log('🔄 Submission data refetched');
        } catch (error) {
            console.error('Failed to update document status:', error);
            toast.error('Failed to update document status');
        }
    };

    const handleFoldersCreated = (theoryId: string, labId: string) => {
        console.log('📁 Folders created successfully:', { theoryId, labId });
        setTheoryFolderId(theoryId);
        setLabFolderId(labId);
    };


    const handleFileUpload = async (documentId: string, file: File, fileType: string, category: 'theory' | 'lab') => {
        // Get the current document state
        const currentDocs = category === 'theory' ? theoryDocuments : labDocuments;
        const doc = currentDocs.find(d => d.id === documentId);
        if (!doc) return;

        // Create updated file metadata
        const updatedFileMetadata = {
            ...doc.uploadedFiles,
            [fileType]: {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            }
        };

        // Check if all required files are now uploaded (check both local files and uploaded files)
        const allFilesUploaded = doc.fileTypes.every(ft =>
            doc.files?.[ft] || updatedFileMetadata[ft] || doc.uploadedFiles?.[ft]
        );
        const newStatus = allFilesUploaded ? 'yes' : doc.status;

        console.log('📊 Document completion check:', {
            documentId,
            documentName: doc.name,
            requiredFileTypes: doc.fileTypes,
            currentFiles: Object.keys(doc.files || {}),
            newFiles: Object.keys(updatedFileMetadata),
            existingUploaded: Object.keys(doc.uploadedFiles || {}),
            allFilesUploaded,
            currentStatus: doc.status,
            newStatus
        });

        // Update local state first for immediate UI feedback
        if (category === 'theory') {
            setTheoryDocuments(prev =>
                prev.map(d => d.id === documentId ? {
                    ...d,
                    files: { ...d.files, [fileType]: file },
                    uploadedFiles: updatedFileMetadata,
                    status: newStatus
                } : d)
            );
        } else {
            setLabDocuments(prev =>
                prev.map(d => d.id === documentId ? {
                    ...d,
                    files: { ...d.files, [fileType]: file },
                    uploadedFiles: updatedFileMetadata,
                    status: newStatus
                } : d)
            );
        }

        try {
            // Dual upload to personal and shared Google Drive
            let googleDriveId = undefined;
            let url = undefined;
            let uploadResult = { personal: false, shared: false, errors: [] as string[] };

            if (GoogleDriveService.isSignedIn()) {
                const targetFolderId = category === 'theory' ? theoryFolderId : labFolderId;

                if (!targetFolderId) {
                    console.log(`⚠️ ${category} folder not ready yet, skipping Google Drive upload`);
                    sonnerToast.error(`${category} folder not ready. Please wait for Google Drive setup to complete.`);
                    return;
                }

                console.log(`📤 Starting dual upload for ${fileType}...`);

                const fileName = `${fileType}_${file.name}`;

                // Generate shared folder path
                const courseInfo = {
                    semester: submissionParams?.semester || '',
                    courseCode: submissionParams?.courseCode || '',
                    courseSection: submissionParams?.courseSection || '',
                    batch: submissionParams?.batch,
                    department: submissionParams?.department
                };
                const sharedFolderPath = SharedDriveService.generateSharedFolderPath(
                    courseInfo,
                    category === 'theory' ? 'Theory' : 'Lab'
                );

                // Upload to both drives
                const dualUploadResult = await SharedDriveService.uploadToPersonalAndShared(
                    file,
                    fileName,
                    targetFolderId,
                    sharedFolderPath
                );

                uploadResult = {
                    personal: dualUploadResult.personal !== null,
                    shared: dualUploadResult.shared !== null,
                    errors: dualUploadResult.errors
                };

                // Use personal drive file for database storage
                if (dualUploadResult.personal) {
                    googleDriveId = dualUploadResult.personal.id;
                    url = dualUploadResult.personal.webViewLink;
                }

                // Update upload results state
                setUploadResults(prev => [...prev, uploadResult]);

                // Show appropriate success/error messages
                if (dualUploadResult.success) {
                    if (uploadResult.personal && uploadResult.shared) {
                        sonnerToast.success(`${fileType} uploaded to both personal and shared drives successfully!`);
                    } else if (uploadResult.personal) {
                        sonnerToast.warning(`${fileType} uploaded to personal drive only. Shared drive upload failed.`);
                    } else if (uploadResult.shared) {
                        sonnerToast.warning(`${fileType} uploaded to shared drive only. Personal drive upload failed.`);
                    }
                } else {
                    sonnerToast.error(`Failed to upload ${fileType} to Google Drive.`);
                    console.error('Dual upload errors:', dualUploadResult.errors);
                }

                console.log(`✅ Dual upload completed:`, dualUploadResult);
            } else {
                console.log('ℹ️ Google Drive not connected, file stored locally only');
                uploadResult.errors.push('Google Drive not connected');
                setUploadResults(prev => [...prev, uploadResult]);
            }

            // Update database with file metadata including Google Drive info
            const finalFileMetadata = {
                ...updatedFileMetadata,
                [fileType]: {
                    ...updatedFileMetadata[fileType],
                    googleDriveId,
                    url
                }
            };

            // Call database update first, then refetch to get the updated completion status
            console.log('🔄 Updating document in database...');
            await updateDocumentInDatabase(documentId, category, newStatus, finalFileMetadata);

            console.log('🎯 File upload completed successfully:', {
                documentId,
                newStatus,
                allFilesUploaded,
                completionShouldUpdate: newStatus === 'yes'
            });

        } catch (error) {
            console.error('❌ Error uploading to Google Drive or updating database:', error);
            sonnerToast.error('File saved locally, but failed to upload to Google Drive or save to database.');

            // Revert local state on error
            if (category === 'theory') {
                setTheoryDocuments(prev =>
                    prev.map(d => d.id === documentId ? {
                        ...d,
                        files: Object.fromEntries(
                            Object.entries(d.files || {}).filter(([key]) => key !== fileType)
                        ),
                        uploadedFiles: doc.uploadedFiles,
                        status: doc.status
                    } : d)
                );
            } else {
                setLabDocuments(prev =>
                    prev.map(d => d.id === documentId ? {
                        ...d,
                        files: Object.fromEntries(
                            Object.entries(d.files || {}).filter(([key]) => key !== fileType)
                        ),
                        uploadedFiles: doc.uploadedFiles,
                        status: doc.status
                    } : d)
                );
            }
        }
    };

    const getFileTypeDisplayName = (fileType: string): string => {
        const displayNames: Record<string, string> = {
            'marginal': 'Marginal Script',
            'average': 'Average Script',
            'excellent': 'Excellent Script',
            'question': 'Question Paper',
            'doc': 'Document (.doc)',
            'class-attendance': 'Class Attendance',
            'midterm-attendance': 'Midterm Attendance',
            'final-attendance': 'Final Attendance',
            'assignment-marks': 'Assignment Marks',
            'presentation-marks': 'Presentation Marks',
            'tabulation': 'Tabulation Sheet',
            'co-po-mapping': 'CO-PO Mapping',
            'course-end-report': 'Course End Report',
            'lab-report': 'Lab Report',
            'lab-performance': 'Lab Performance',
            'lab-final': 'Lab Final',
            'project': 'Project',
            'projects-list': 'Projects List',
            'experiments-list': 'Experiments List',
            'attendance': 'Attendance'
        };
        return displayNames[fileType] || fileType.charAt(0).toUpperCase() + fileType.slice(1);
    };

    const getFileTypeColor = (fileType: string): string => {
        const colors: Record<string, string> = {
            'marginal': 'bg-red-50 text-red-700 hover:bg-red-100',
            'average': 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
            'excellent': 'bg-green-50 text-green-700 hover:bg-green-100',
            'question': 'bg-purple-50 text-purple-700 hover:bg-purple-100',
            'doc': 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        };
        return colors[fileType] || 'bg-gray-50 text-gray-700 hover:bg-gray-100';
    };

    const handleStatusChange = async (documentId: string, status: 'yes' | 'no', category: 'theory' | 'lab') => {
        // Get the current document
        const currentDocs = category === 'theory' ? theoryDocuments : labDocuments;
        const doc = currentDocs.find(d => d.id === documentId);
        if (!doc) return;

        // If setting to 'yes', check if all files are uploaded
        if (status === 'yes') {
            const allFilesUploaded = doc.fileTypes.every(ft => doc.files?.[ft] || doc.uploadedFiles?.[ft]);
            if (!allFilesUploaded) {
                toast.error('Please upload all required files before marking as submitted.');
                return;
            }
        }

        // Update local state first for immediate UI feedback
        const updateDoc = (d: DocumentItem) => d.id === documentId ? {
            ...d,
            status,
            ...(status === 'no' && { files: undefined, uploadedFiles: undefined })
        } : d;

        if (category === 'theory') {
            setTheoryDocuments(prev => prev.map(updateDoc));
        } else {
            setLabDocuments(prev => prev.map(updateDoc));
        }

        // Update database
        try {
            const uploadedFiles = status === 'no' ? {} : doc.uploadedFiles;
            await updateDocumentInDatabase(documentId, category, status, uploadedFiles);
        } catch (error) {
            console.error('Failed to update document status in database:', error);
            toast.error('Failed to save changes to database');
        }
    };

    // Handle final submission
    const handleFinalSubmit = async () => {
        if (!currentSubmission?.data) {
            toast.error('No submission found to submit');
            return;
        }

        // Check if all documents are completed before submission
        if (!isAllDocumentsCompleted()) {
            toast.error('Please complete all required documents before submitting');
            return;
        }

        try {
            isSubmittingRef.current = true; // Mark as submitting to prevent document updates
            setIsSyncingDocuments(true); // Show syncing status
            console.log('🚀 Starting final submission process...');

            // Debug current document statuses
            debugDocumentStatuses();

            // Force update all document statuses to ensure database is in sync
            console.log('🔄 Syncing document statuses with database...');
            const syncPromises: Promise<void>[] = [];

            // Sync theory documents that are marked as 'yes'
            theoryDocuments.forEach(doc => {
                if (doc.status === 'yes') {
                    console.log(`📋 Syncing theory document: ${doc.name} (${doc.id})`);
                    syncPromises.push(
                        updateDocumentInDatabase(doc.id, 'theory', 'yes', doc.uploadedFiles)
                    );
                }
            });

            // Sync lab documents that are marked as 'yes'
            labDocuments.forEach(doc => {
                if (doc.status === 'yes') {
                    console.log(`📋 Syncing lab document: ${doc.name} (${doc.id})`);
                    syncPromises.push(
                        updateDocumentInDatabase(doc.id, 'lab', 'yes', doc.uploadedFiles)
                    );
                }
            });

            // Wait for all sync operations to complete
            if (syncPromises.length > 0) {
                console.log(`⏳ Waiting for ${syncPromises.length} document sync operations...`);
                await Promise.all(syncPromises);
                console.log('✅ All document statuses synced with database');

                // Wait a moment for the database to update completion percentage
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Refetch submission to get the latest completion percentage
                console.log('🔄 Refetching submission data...');
                await refetchSubmission();
            }

            setIsSyncingDocuments(false); // Hide syncing status

            // Now attempt submission
            console.log('📤 Attempting final submission...');
            await submitDocumentSubmission(currentSubmission.data._id).unwrap();

            console.log('✅ Submission successful');
            toast.success('Documents submitted successfully for review!');

            // Keep the submission flag true to prevent any document resets
            // It will be cleared when the component unmounts or reloads

        } catch (error) {
            console.error('Failed to submit documents:', error);

            // Provide more detailed error message
            if (error && typeof error === 'object' && 'data' in error) {
                const errorData = error.data as { message?: string };
                if (errorData.message) {
                    toast.error(`Submission failed: ${errorData.message}`);
                    console.error('Server error details:', errorData);
                } else {
                    toast.error('Failed to submit documents. Please try again.');
                }
            } else {
                toast.error('Failed to submit documents. Please try again.');
            }

            setIsSyncingDocuments(false); // Hide syncing status on error
            isSubmittingRef.current = false; // Reset flag on error
        }
    };

    // Function to check if all documents are completed
    const isAllDocumentsCompleted = (): boolean => {
        const allTheoryCompleted = theoryDocuments.every(doc => doc.status === 'yes');
        const allLabCompleted = labDocuments.every(doc => doc.status === 'yes');
        return allTheoryCompleted && allLabCompleted;
    };

    // Debug function to check document statuses
    const debugDocumentStatuses = () => {
        console.log('🔍 Current document statuses:');
        console.log('Theory documents:', theoryDocuments.map(doc => ({
            id: doc.id,
            name: doc.name,
            status: doc.status,
            hasFiles: Object.keys(doc.uploadedFiles || {}).length > 0
        })));
        console.log('Lab documents:', labDocuments.map(doc => ({
            id: doc.id,
            name: doc.name,
            status: doc.status,
            hasFiles: Object.keys(doc.uploadedFiles || {}).length > 0
        })));
        console.log('All completed:', isAllDocumentsCompleted());
    };

    // Calculate completion stats
    const getCompletionStats = () => {
        const totalDocuments = theoryDocuments.length + labDocuments.length;
        const completedDocuments = [...theoryDocuments, ...labDocuments].filter(doc => doc.status === 'yes').length;
        const pendingDocuments = totalDocuments - completedDocuments;

        return {
            total: totalDocuments,
            completed: completedDocuments,
            pending: pendingDocuments,
            percentage: totalDocuments > 0 ? Math.round((completedDocuments / totalDocuments) * 100) : 0
        };
    };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();

    //     try {
    //         // Create FormData for file uploads
    //         const formData = new FormData();

    //         // Add course and teacher info
    //         formData.append('courseInfo', JSON.stringify(courseInfo));
    //         formData.append('teacherInfo', JSON.stringify(teacherInfo));

    //         let hasFilesToSubmit = false;

    //         // Add theory documents that haven't been submitted yet
    //         theoryDocuments.forEach((doc, index) => {
    //             if (doc.files && doc.status !== 'yes') {
    //                 Object.entries(doc.files).forEach(([fileType, file]) => {
    //                     if (file) {
    //                         formData.append(`theoryFiles`, file);
    //                         formData.append(`theoryFileData_${index}_${fileType}`, JSON.stringify({
    //                             id: doc.id,
    //                             name: doc.name,
    //                             fileType,
    //                             status: doc.status,
    //                         }));
    //                         hasFilesToSubmit = true;
    //                     }
    //                 });
    //             }
    //         });

    //         // Add lab documents that haven't been submitted yet
    //         labDocuments.forEach((doc, index) => {
    //             if (doc.files && doc.status !== 'yes') {
    //                 Object.entries(doc.files).forEach(([fileType, file]) => {
    //                     if (file) {
    //                         formData.append(`labFiles`, file);
    //                         formData.append(`labFileData_${index}_${fileType}`, JSON.stringify({
    //                             id: doc.id,
    //                             name: doc.name,
    //                             fileType,
    //                             status: doc.status,
    //                         }));
    //                         hasFilesToSubmit = true;
    //                     }
    //                 });
    //             }
    //         });

    //         if (!hasFilesToSubmit) {
    //             toast.error('No new documents to submit. All documents have already been submitted or no files uploaded.');
    //             return;
    //         }

    //         await submitDocuments(formData).unwrap();
    //         toast.success('All remaining documents submitted successfully!');

    //         // Mark all submitted documents as 'yes'
    //         setTheoryDocuments(prev =>
    //             prev.map(doc =>
    //                 doc.files && Object.keys(doc.files).length > 0
    //                     ? { ...doc, status: 'yes' as const }
    //                     : doc
    //             )
    //         );
    //         setLabDocuments(prev =>
    //             prev.map(doc =>
    //                 doc.files && Object.keys(doc.files).length > 0
    //                     ? { ...doc, status: 'yes' as const }
    //                     : doc
    //             )
    //         );

    //     } catch (error) {
    //         console.error('Error submitting documents:', error);
    //         toast.error('Failed to submit documents. Please try again.');
    //     }
    // };
console.log(currentSubmission?.data?.submissionStatus)
console.log(currentSubmission)
    const renderDocumentTable = (documents: DocumentItem[], category: 'theory' | 'lab', title: string) => (
        <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 bg-orange-100 p-3 rounded-t-lg border">
                {title}
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-b-lg">
                <table className="w-full bg-white">
                    <thead className="bg-orange-200">
                        <tr>
                            <th className="border border-gray-300 p-3 text-left font-medium text-gray-800 min-w-[300px]">
                                Check List (Upload in Section Wise OBE Drive)
                            </th>
                            <th className="border border-gray-300 p-3 text-center font-medium text-gray-800 min-w-[400px]">
                                File Uploads
                            </th>
                            <th className="border border-gray-300 p-3 text-center font-medium w-32 text-gray-800">
                                Submitted (Yes / No)
                            </th>
                            <th className="border border-gray-300 p-3 text-center font-medium w-32 text-gray-800">
                                Completion Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc, index) => (
                            <tr key={doc.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 p-3 text-gray-800">
                                    {doc.name}
                                </td>

                                {/* Local File Upload Section */}
                                <td className="border border-gray-300 p-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {doc.fileTypes.map((fileType) => (
                                            <div key={fileType} className="space-y-1">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    {getFileTypeDisplayName(fileType)}
                                                </label>
                                                <input
                                                    placeholder='Select file...'
                                                    type="file"
                                                    id={`${fileType}-${doc.id}`}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleFileUpload(doc.id, file, fileType, category);
                                                        }
                                                    }}
                                                    className={`block w-full text-xs text-gray-900 file:mr-1 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:${getFileTypeColor(fileType)}`}
                                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                                />
                                                {GoogleDriveService.isSignedIn() && (theoryFolderId || labFolderId) && (
                                                    <div className="text-xs text-blue-600 flex items-center mt-1">
                                                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                        </svg>
                                                        Will sync to Drive
                                                    </div>
                                                )}
                                                {doc.files?.[fileType] && (
                                                    <div className="text-xs text-green-600 font-medium truncate">
                                                        ✓ {doc.files[fileType].name}
                                                    </div>
                                                )}
                                                {!doc.files?.[fileType] && doc.uploadedFiles?.[fileType] && (
                                                    <div className="text-xs text-blue-600 font-medium truncate">
                                                        ✓ {doc.uploadedFiles[fileType].name} (uploaded)
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </td>

                                {/* Status Dropdown */}
                                <td className="border border-gray-300 p-3 text-center">
                                    <select
                                        title='Select status'
                                        value={doc.status}
                                        onChange={(e) => handleStatusChange(doc.id, e.target.value as 'yes' | 'no', category)}
                                        className={`w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white ${doc.status === 'yes' ? 'bg-green-50 border-green-300' :
                                            doc.status === 'no' ? 'bg-red-50 border-red-300' :
                                                'bg-yellow-50 border-yellow-300'
                                            }`}
                                    >
                                        <option value="pending">-</option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                    {doc.status === 'yes' && (
                                        <div className="text-xs text-green-600 mt-1 font-medium">✓ Complete</div>
                                    )}
                                    {doc.status === 'no' && (
                                        <div className="text-xs text-red-600 mt-1 font-medium">✗ Not submitted</div>
                                    )}
                                    {doc.status === 'pending' && (
                                        <div className="text-xs text-yellow-600 mt-1 font-medium">⚠ Pending</div>
                                    )}
                                </td>

                                {/* File Completion Checkboxes */}
                                <td className="border border-gray-300 p-3">
                                    <div className="space-y-2">
                                        {doc.fileTypes.map((fileType) => {
                                            const hasFile = !!(doc.files?.[fileType] || doc.uploadedFiles?.[fileType]);

                                            return (
                                                <div key={fileType} className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-700 truncate mr-2">
                                                        {getFileTypeDisplayName(fileType)}
                                                    </span>
                                                    <div className="flex items-center">
                                                        <input
                                                            placeholder='Select file...'
                                                            type="checkbox"
                                                            checked={hasFile}
                                                            readOnly
                                                            className={`h-4 w-4 rounded border-gray-300 focus:ring-2 bg-white focus:ring-blue-500 ${hasFile
                                                                ? 'text-green-600 bg-green-50'
                                                                : 'text-gray-400'
                                                                }`}
                                                        />
                                                        {hasFile && (
                                                            <svg className="h-4 w-4 text-green-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Overall completion indicator */}
                                        <div className="pt-2 border-t border-gray-200 mt-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-gray-800">
                                                    Complete:
                                                </span>
                                                <div className="flex items-center">
                                                    <span className="text-xs text-gray-600 mr-2">
                                                        {doc.fileTypes.filter(ft => doc.files?.[ft] || doc.uploadedFiles?.[ft]).length}/{doc.fileTypes.length}
                                                    </span>
                                                    {doc.fileTypes.every(ft => doc.files?.[ft] || doc.uploadedFiles?.[ft]) ? (
                                                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className=" rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                        OBE File Submission System
                    </h1>

                    {/* Dual Upload System Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    Enhanced Dual Upload System
                                </h3>
                                <div className="text-blue-800 space-y-2">
                                    <p>
                                        <strong>📁 Personal Drive:</strong> Files are saved to your personal Google Drive in organized course folders for easy access.
                                    </p>
                                    <p>
                                        <strong>🏛️ Institutional Shared Drive:</strong> Files are simultaneously uploaded to the shared institutional drive for administrative oversight and backup.
                                    </p>
                                    <p>
                                        <strong>🔄 Automatic Organization:</strong> Files are organized by Year/Semester/Course/Category structure in both drives.
                                    </p>
                                    <div className="bg-blue-100 rounded-lg p-3 mt-3">
                                        <p className="text-sm">
                                            <strong>Note:</strong> Even if one upload fails, the other will continue. You'll be notified of the status of both uploads.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {submissionLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading submission data...</span>
                        </div>
                    )}

                    {/* Single Google Drive Connection */}
                    {isSubmitted && <div className="mb-8">
                        <GoogleDriveConnection
                            courseInfo={{
                                courseCode: courseInfo.courseCode,
                                courseSection: courseInfo.courseSection,
                                batch: batch,
                                department: department,
                                semester: courseInfo.semester,
                            }}
                            onFoldersCreated={handleFoldersCreated}
                        />

                        {/* Shared Drive Status */}
                        <SharedDriveStatus
                            isConnected={GoogleDriveService.isSignedIn()}
                            uploadResults={uploadResults}
                        />
                    </div>}
                    {!isSubmitted &&
                        <SectionInformation from={"file-submission"} />
                    }
                    {
                        isSubmitted &&
                        <div className="space-y-8">
                            {/* Course Information and Teacher Information Side by Side */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Teacher Information */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800 bg-orange-100 p-3 rounded border">
                                        Course Teacher Information
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className=" font-medium text-gray-700 mb-2">
                                                Course Teacher Name with Initial : <span className='font-normal'>{teacherInfo.teacherName}</span>
                                            </h3>

                                        </div>
                                        <div>
                                            <h3 className=" font-medium text-gray-700 mb-2">
                                                Employee ID : <span className='font-normal'>{teacherInfo.employeeId}</span>
                                            </h3>

                                        </div>
                                        <div>
                                            <h3 className=" font-medium text-gray-700 mb-2">
                                                Designation : <span className='font-normal'>{teacherInfo.designation}</span>
                                            </h3>

                                        </div>
                                        <div>
                                            <h3 className=" font-medium text-gray-700 mb-2">
                                                Email ID : <span className='font-normal'>{teacherInfo.emailId}</span>
                                            </h3>

                                        </div>
                                        <div>
                                            <h3 className=" font-medium text-gray-700 mb-2">
                                                Mobile Number : <span className='font-normal'>{teacherInfo.mobileNumber}</span>
                                            </h3>

                                        </div>
                                    </div>
                                </div>
                                {/* Course Information */}
                                <div className="border border-gray-200 rounded-lg p-6">
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800 bg-orange-100 p-3 rounded border">
                                        Course Information
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium text-gray-700 mb-2">
                                                Semester : <span className='font-normal'>{courseInfo.semester}</span>
                                            </h3>

                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-700 mb-2">
                                                Course Code : <span className='font-normal'>{courseInfo.courseCode}</span>
                                            </h3>

                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-700 mb-2">
                                                Course Title : <span className='font-normal'>{courseInfo.courseTitle}</span>
                                            </h3>

                                        </div>
                                        <div>
                                            <h3 className=" font-medium text-gray-700 mb-2">
                                                Credit Hours : <span className='font-normal'>{courseInfo.creditHours}</span>
                                            </h3>

                                        </div>
                                        <div>
                                            <h3 className=" font-medium text-gray-700 mb-2">
                                                Course Section : <span className='font-normal'>{courseInfo.courseSection}</span>
                                            </h3>

                                        </div>
                                        <div>
                                            <h3 className=" font-medium text-gray-700 mb-2">
                                                Number of Class Conducted :
                                                <span className='font-normal'>{courseInfo.classCount}</span>
                                            </h3>

                                        </div>
                                    </div>
                                </div>


                            </div>



                            {/* Submission Progress */}
                            {currentSubmission?.data && (
                                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-blue-800">Submission Progress</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700">Completion Status:</span>
                                            <span className="font-semibold text-blue-800">
                                                {getCompletionStats().completed}/{getCompletionStats().total} documents ({getCompletionStats().percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${getCompletionStats().percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-blue-600">
                                                Status: {currentSubmission.data.submissionStatus.toUpperCase()}
                                            </span>
                                            <span className="text-blue-600">
                                                Last Modified: {new Date(currentSubmission.data.lastModifiedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {!isAllDocumentsCompleted() && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                                                <p className="text-yellow-800 text-sm">
                                                    <strong>Note:</strong> Submit button will be enabled only when all documents are marked as "Yes".
                                                    Please complete all required document uploads and mark them as submitted.
                                                    <br />
                                                    <strong>Remaining:</strong> {getCompletionStats().pending} document(s) need to be completed.
                                                </p>
                                            </div>
                                        )}
                                        {isAllDocumentsCompleted() && currentSubmission.data.submissionStatus !== 'submitted' && (
                                            <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                                                <p className="text-green-800 text-sm">
                                                    <strong>🎉 All documents completed!</strong> You can now submit your documents for review.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}                            {/* Theory Documents */}
                            {renderDocumentTable(theoryDocuments, 'theory', 'OBE File Submission Checklist (Theory)')}

                            {/* Lab Documents */}
                            {renderDocumentTable(labDocuments, 'lab', 'OBE File Submission Checklist (Lab)')}

                            {/* Final Submit Button */}
                            {currentSubmission?.data && currentSubmission.data.submissionStatus !== 'submitted' && (
                                <div className="mt-8 text-center">
                                    {isSyncingDocuments && (
                                        <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                                            <div className="flex items-center justify-center">
                                                <LoadingSpinner />
                                                <span className="ml-2 text-blue-700 font-medium">
                                                    Syncing document statuses with database...
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleFinalSubmit}
                                        className={`font-bold py-3 px-8 rounded-lg shadow-lg transition-colors duration-200 ${isAllDocumentsCompleted() && !submissionLoading && !isSyncingDocuments
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                            }`}
                                        disabled={!isAllDocumentsCompleted() || submissionLoading || isSyncingDocuments}
                                    >
                                        {submissionLoading || isSyncingDocuments ? (
                                            <span className="flex items-center">
                                                <LoadingSpinner />
                                                <span className="ml-2">
                                                    {isSyncingDocuments ? 'Syncing...' : 'Submitting...'}
                                                </span>
                                            </span>
                                        ) : (
                                            'Submit All Documents for Review'
                                        )}
                                    </button>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {!isAllDocumentsCompleted()
                                            ? `Complete all documents to enable submission. Current progress: ${getCompletionStats().completed}/${getCompletionStats().total} (${getCompletionStats().percentage}%)`
                                            : 'Once submitted, documents will be sent for review and cannot be modified.'
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Submission Status */}
                            {currentSubmission?.data?.submissionStatus === 'submitted' && (
                                <div className="mt-8">
                                    <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
                                        <div className="text-green-800">
                                            <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <h3 className="text-xl font-semibold mb-2">Documents Submitted Successfully!</h3>
                                            <p className="text-green-700">
                                                Your documents have been submitted for review on{' '}
                                                {currentSubmission.data.submittedAt ?
                                                    new Date(currentSubmission.data.submittedAt).toLocaleDateString() :
                                                    'Unknown date'
                                                }
                                            </p>
                                            {currentSubmission.data.completionPercentage !== undefined && (
                                                <p className="text-green-700 mt-2">
                                                    Completion: {currentSubmission.data.completionPercentage}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* PDF Generator */}
                                    <PDFGenerator submissionData={currentSubmission.data} />
                                </div>
                            )}


                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

export default DocumentSubmission;
