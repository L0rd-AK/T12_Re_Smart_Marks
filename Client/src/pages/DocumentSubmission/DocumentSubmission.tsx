import React, { useState, useEffect } from 'react';
import { useSubmitDocumentsMutation } from '../../redux/api/documentApi';
import toast from 'react-hot-toast';
import { toast as sonnerToast } from 'sonner';
import GoogleDriveConnection from '../../components/GoogleDriveConnection';
import { GoogleDriveService } from '../../services/googleDriveService';


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
    const [submitDocuments] = useSubmitDocumentsMutation();
    const [theoryFolderId, setTheoryFolderId] = useState<string | null>(null);
    const [labFolderId, setLabFolderId] = useState<string | null>(null);

    // Helper functions for localStorage persistence
    const saveDocumentsToStorage = (theory: DocumentItem[], lab: DocumentItem[]) => {
        try {
            const documentsState = {
                theory: theory.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    category: doc.category,
                    fileTypes: doc.fileTypes,
                    status: doc.status,
                    uploadedFiles: doc.uploadedFiles
                })),
                lab: lab.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    category: doc.category,
                    fileTypes: doc.fileTypes,
                    status: doc.status,
                    uploadedFiles: doc.uploadedFiles
                }))
            };
            localStorage.setItem('obe_documents_state', JSON.stringify(documentsState));
        } catch (error) {
            console.warn('Failed to save documents state to localStorage:', error);
        }
    };

    const loadDocumentsFromStorage = (): { theory: DocumentItem[], lab: DocumentItem[] } | null => {
        try {
            const stored = localStorage.getItem('obe_documents_state');
            if (!stored) return null;

            const parsed = JSON.parse(stored);
            return {
                theory: parsed.theory || [],
                lab: parsed.lab || []
            };
        } catch (error) {
            console.warn('Failed to load documents state from localStorage:', error);
            return null;
        }
    };

    // Initialize documents with localStorage data if available
    const getInitialDocuments = () => {
        const stored = loadDocumentsFromStorage();

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

        if (stored) {
            return {
                theory: stored.theory.length > 0 ? stored.theory : defaultTheoryDocuments,
                lab: stored.lab.length > 0 ? stored.lab : defaultLabDocuments
            };
        }

        return {
            theory: defaultTheoryDocuments,
            lab: defaultLabDocuments
        };
    };

    const initialDocuments = getInitialDocuments();

    const [courseInfo, setCourseInfo] = useState<CourseInfo>({
        semester: 'Spring 2025',
        courseCode: 'CSE-101',
        courseTitle: 'Web Engineering',
        creditHours: '3',
        courseSection: 'S',
        classCount: '32',
    });

    const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
        teacherName: 'Mehedi Hasan',
        employeeId: '342353',
        designation: 'Lecturer',
        emailId: 'mehedi15-4680@diu.edu.bd',
        mobileNumber: '+8801767705251',
    });

    // Initialize documents based on the checklist from the attachment
    const [theoryDocuments, setTheoryDocuments] = useState<DocumentItem[]>(initialDocuments.theory);

    const [labDocuments, setLabDocuments] = useState<DocumentItem[]>(initialDocuments.lab);

    // Save to localStorage whenever documents change
    useEffect(() => {
        saveDocumentsToStorage(theoryDocuments, labDocuments);
    }, [theoryDocuments, labDocuments]);

    const handleFoldersCreated = (theoryId: string, labId: string) => {
        console.log('📁 Folders created successfully:', { theoryId, labId });
        setTheoryFolderId(theoryId);
        setLabFolderId(labId);
    };

    const handleCourseInfoChange = (field: keyof CourseInfo, value: string) => {
        setCourseInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleTeacherInfoChange = (field: keyof TeacherInfo, value: string) => {
        setTeacherInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (documentId: string, file: File, fileType: string, category: 'theory' | 'lab') => {
        // First, update the local state
        if (category === 'theory') {
            setTheoryDocuments(prev =>
                prev.map(doc => {
                    if (doc.id === documentId) {
                        const updatedFiles = {
                            ...doc.files,
                            [fileType]: file
                        };
                        const updatedFileMetadata = {
                            ...doc.uploadedFiles,
                            [fileType]: {
                                name: file.name,
                                size: file.size,
                                type: file.type,
                                lastModified: file.lastModified
                            }
                        };
                        // Check if all required files are now uploaded (including previously uploaded ones)
                        const allFilesUploaded = doc.fileTypes.every(ft => updatedFiles[ft] || updatedFileMetadata[ft]);
                        return {
                            ...doc,
                            files: updatedFiles,
                            uploadedFiles: updatedFileMetadata,
                            status: allFilesUploaded ? 'yes' as const : doc.status
                        };
                    }
                    return doc;
                })
            );
        } else {
            setLabDocuments(prev =>
                prev.map(doc => {
                    if (doc.id === documentId) {
                        const updatedFiles = {
                            ...doc.files,
                            [fileType]: file
                        };
                        const updatedFileMetadata = {
                            ...doc.uploadedFiles,
                            [fileType]: {
                                name: file.name,
                                size: file.size,
                                type: file.type,
                                lastModified: file.lastModified
                            }
                        };
                        // Check if all required files are now uploaded (including previously uploaded ones)
                        const allFilesUploaded = doc.fileTypes.every(ft => updatedFiles[ft] || updatedFileMetadata[ft]);
                        return {
                            ...doc,
                            files: updatedFiles,
                            uploadedFiles: updatedFileMetadata,
                            status: allFilesUploaded ? 'yes' as const : doc.status
                        };
                    }
                    return doc;
                })
            );
        }

        // Then, upload to Google Drive if user is signed in and folder exists
        try {
            if (GoogleDriveService.isSignedIn()) {
                const targetFolderId = category === 'theory' ? theoryFolderId : labFolderId;

                if (!targetFolderId) {
                    console.log(`⚠️ ${category} folder not ready yet, skipping Google Drive upload`);
                    sonnerToast.error(`${category} folder not ready. Please wait for Google Drive setup to complete.`);
                    return;
                }

                console.log(`📤 Uploading ${fileType} to Google Drive (${category} folder: ${targetFolderId})...`);

                // Upload file directly to the pre-created category folder
                const fileName = `${fileType}_${file.name}`;
                const uploadedFile = await GoogleDriveService.uploadFile(file, fileName, targetFolderId);

                console.log(`✅ File uploaded to Google Drive:`, uploadedFile);
                sonnerToast.success(`${fileType} uploaded to Google Drive ${category} folder successfully!`);
            } else {
                console.log('ℹ️ Google Drive not connected, file stored locally only');
            }
        } catch (error) {
            console.error('❌ Error uploading to Google Drive:', error);
            sonnerToast.error('File saved locally, but failed to upload to Google Drive. You can connect to Google Drive later.');
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

    const handleStatusChange = (documentId: string, status: 'yes' | 'no', category: 'theory' | 'lab') => {
        if (category === 'theory') {
            setTheoryDocuments(prev =>
                prev.map(doc => {
                    if (doc.id === documentId) {
                        // If setting to 'yes', check if all files are uploaded
                        if (status === 'yes') {
                            const allFilesUploaded = doc.fileTypes.every(ft => doc.files?.[ft] || doc.uploadedFiles?.[ft]);
                            if (!allFilesUploaded) {
                                toast.error('Please upload all required files before marking as submitted.');
                                return doc; // Don't change status
                            }
                        }

                        return {
                            ...doc,
                            status,
                            ...(status === 'no' && { files: undefined, uploadedFiles: undefined })
                        };
                    }
                    return doc;
                })
            );
        } else {
            setLabDocuments(prev =>
                prev.map(doc => {
                    if (doc.id === documentId) {
                        // If setting to 'yes', check if all files are uploaded
                        if (status === 'yes') {
                            const allFilesUploaded = doc.fileTypes.every(ft => doc.files?.[ft] || doc.uploadedFiles?.[ft]);
                            if (!allFilesUploaded) {
                                toast.error('Please upload all required files before marking as submitted.');
                                return doc; // Don't change status
                            }
                        }

                        return {
                            ...doc,
                            status,
                            ...(status === 'no' && { files: undefined, uploadedFiles: undefined })
                        };
                    }
                    return doc;
                })
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Create FormData for file uploads
            const formData = new FormData();

            // Add course and teacher info
            formData.append('courseInfo', JSON.stringify(courseInfo));
            formData.append('teacherInfo', JSON.stringify(teacherInfo));

            let hasFilesToSubmit = false;

            // Add theory documents that haven't been submitted yet
            theoryDocuments.forEach((doc, index) => {
                if (doc.files && doc.status !== 'yes') {
                    Object.entries(doc.files).forEach(([fileType, file]) => {
                        if (file) {
                            formData.append(`theoryFiles`, file);
                            formData.append(`theoryFileData_${index}_${fileType}`, JSON.stringify({
                                id: doc.id,
                                name: doc.name,
                                fileType,
                                status: doc.status,
                            }));
                            hasFilesToSubmit = true;
                        }
                    });
                }
            });

            // Add lab documents that haven't been submitted yet
            labDocuments.forEach((doc, index) => {
                if (doc.files && doc.status !== 'yes') {
                    Object.entries(doc.files).forEach(([fileType, file]) => {
                        if (file) {
                            formData.append(`labFiles`, file);
                            formData.append(`labFileData_${index}_${fileType}`, JSON.stringify({
                                id: doc.id,
                                name: doc.name,
                                fileType,
                                status: doc.status,
                            }));
                            hasFilesToSubmit = true;
                        }
                    });
                }
            });

            if (!hasFilesToSubmit) {
                toast.error('No new documents to submit. All documents have already been submitted or no files uploaded.');
                return;
            }

            await submitDocuments(formData).unwrap();
            toast.success('All remaining documents submitted successfully!');

            // Mark all submitted documents as 'yes'
            setTheoryDocuments(prev =>
                prev.map(doc =>
                    doc.files && Object.keys(doc.files).length > 0
                        ? { ...doc, status: 'yes' as const }
                        : doc
                )
            );
            setLabDocuments(prev =>
                prev.map(doc =>
                    doc.files && Object.keys(doc.files).length > 0
                        ? { ...doc, status: 'yes' as const }
                        : doc
                )
            );

        } catch (error) {
            console.error('Error submitting documents:', error);
            toast.error('Failed to submit documents. Please try again.');
        }
    };

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
                                        value={doc.status}
                                        onChange={(e) => handleStatusChange(doc.id, e.target.value as 'yes' | 'no', category)}
                                        className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                    >
                                        <option value="pending">-</option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
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
                                                            type="checkbox"
                                                            checked={hasFile}
                                                            readOnly
                                                            className={`h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 ${hasFile
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="bg-white rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                        OBE File Submission System
                    </h1>
                    {/* Single Google Drive Connection */}
                    <div className="mb-8">
                        <GoogleDriveConnection
                            courseInfo={{
                                courseCode: courseInfo.courseCode || 'CSE-101',
                                courseSection: courseInfo.courseSection || 'A',
                                batch: '61'
                            }}
                            onFoldersCreated={handleFoldersCreated}
                        />
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
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



                        {/* Theory Documents */}
                        {renderDocumentTable(theoryDocuments, 'theory', 'OBE File Submission Checklist (Theory)')}

                        {/* Lab Documents */}
                        {renderDocumentTable(labDocuments, 'lab', 'OBE File Submission Checklist (Lab)')}

                        {/* Submit Button */}
                        {/* <div className="flex justify-center pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit All Remaining Documents'
                                )}
                            </button>
                        </div> */}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DocumentSubmission;
