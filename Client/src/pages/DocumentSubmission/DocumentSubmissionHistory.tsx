import React from 'react';
import { useNavigate } from 'react-router';
import { useGetDocumentSubmissionsQuery } from '../../redux/api/documentApi';
import type { DocumentSubmissionResponse } from '../../redux/api/documentApi';
import { useAppDispatch } from '../../redux/hooks';
import { setSectionInfo } from '../../redux/features/sectionInformationSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const DocumentSubmissionHistory: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { data: submissions, isLoading, error } = useGetDocumentSubmissionsQuery();

    if (isLoading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Submissions</h2>
                    <p className="text-red-600">Failed to load submission history. Please try again later.</p>
                </div>
            </div>
        );
    }

    const submissionsList = submissions?.data || [];

    const handleContinueEditing = (submission: DocumentSubmissionResponse) => {
        // Extract semester and year from the submission's semester field
        const [semester, year] = submission.courseInfo.semester.split('-');

        // Dispatch course information to Redux state
        dispatch(setSectionInfo({
            department: submission.courseInfo.department,
            section: submission.courseInfo.courseSection,
            batch: submission.courseInfo.batch,
            semester: semester,
            courseTitle: submission.courseInfo.courseTitle,
            courseCode: submission.courseInfo.courseCode,
            year: year,
            courseCredit: submission.courseInfo.creditHours,
            noOfClassConducted: submission.courseInfo.classCount
        }));

        // Navigate to document submission page
        navigate('/document-submission');
    };

    return (
        <div className=" px-4 py-8 bg-white">
            <div className="container mx-auto  ">
                <div className="  p-6 rounded-t-lg">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">Document Submission History</h1>
                    <p className=" mt-2 text-gray-600 ">View all your past document submissions</p>
                </div>

                <div className="p-6">
                    {submissionsList.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No Submissions Found</h3>
                            <p className="text-gray-500">You haven't submitted any documents yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {submissionsList.map((submission: DocumentSubmissionResponse) => (
                                <div key={submission._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {submission.courseInfo.courseCode} - {submission.courseInfo.courseTitle}
                                            </h3>
                                            <p className="text-gray-600">
                                                Section: {submission.courseInfo.courseSection} |
                                                Semester: {submission.courseInfo.semester}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${submission.submissionStatus === 'submitted'
                                                    ? 'bg-green-100 text-green-800'
                                                    : submission.submissionStatus === 'partial'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {submission.submissionStatus.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Completion</p>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${submission.completionPercentage || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {submission.completionPercentage || 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Last Modified</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {new Date(submission.lastModifiedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {submission.submittedAt ? 'Submitted' : 'Created'}
                                            </p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {submission.submittedAt
                                                    ? new Date(submission.submittedAt).toLocaleDateString()
                                                    : new Date(submission.createdAt).toLocaleDateString()
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {submission.reviewComments && (
                                        <div className="border-t pt-4">
                                            <p className="text-sm text-gray-500 mb-2">Review Comments</p>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                                {submission.reviewComments}
                                            </p>
                                            {submission.reviewedBy && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Reviewed by: {submission.reviewedBy.name} on{' '}
                                                    {submission.reviewedAt ? new Date(submission.reviewedAt).toLocaleDateString() : 'Unknown date'}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Overall Status: </span>
                                                <span className={`${submission.overallStatus === 'approved'
                                                        ? 'text-green-600'
                                                        : submission.overallStatus === 'rejected'
                                                            ? 'text-red-600'
                                                            : submission.overallStatus === 'in-review'
                                                                ? 'text-blue-600'
                                                                : 'text-gray-600'
                                                    }`}>
                                                    {submission.overallStatus.replace('-', ' ').toUpperCase()}
                                                </span>
                                            </div>

                                            {submission.submissionStatus !== 'submitted' && (
                                                <button
                                                    onClick={() => handleContinueEditing(submission)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Continue Editing →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentSubmissionHistory;
