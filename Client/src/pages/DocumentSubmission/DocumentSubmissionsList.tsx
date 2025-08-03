import React from 'react';
import { useGetDocumentSubmissionsQuery } from '../../redux/api/documentApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const DocumentSubmissionsList: React.FC = () => {
  const { data: submissions, isLoading, error } = useGetDocumentSubmissionsQuery();

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Submissions</h2>
            <p className="text-red-600">Failed to load document submissions. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Document Submissions
            </h1>
            <a
              href="/document-submission"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Submission
            </a>
          </div>

          {!submissions || submissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No Submissions Yet</h2>
              <p className="text-gray-500 mb-6">You haven't submitted any documents yet.</p>
              <a
                href="/document-submission"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Submission
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {submission.courseInfo.courseCode} - {submission.courseInfo.courseTitle}
                      </h3>
                      <p className="text-gray-600">
                        {submission.courseInfo.semester} | Section: {submission.courseInfo.courseSection}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${submission.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(submission.submissionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Teacher Information</h4>
                      <p className="text-sm text-gray-600">{submission.teacherInfo.teacherName}</p>
                      <p className="text-sm text-gray-600">{submission.teacherInfo.designation}</p>
                      <p className="text-sm text-gray-600">{submission.teacherInfo.emailId}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Documents Summary</h4>
                      <div className="flex space-x-4 text-sm">
                        <div>
                          <span className="font-medium">Theory:</span>
                          <span className="ml-1 text-green-600">
                            {submission.documents.theory.filter(doc => doc.status === 'yes').length}
                          </span>
                          <span className="text-gray-500">
                            /{submission.documents.theory.length}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Lab:</span>
                          <span className="ml-1 text-green-600">
                            {submission.documents.lab.filter(doc => doc.status === 'yes').length}
                          </span>
                          <span className="text-gray-500">
                            /{submission.documents.lab.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors">
                      View Details
                    </button>
                    {submission.status === 'pending' && (
                      <button className="px-4 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-colors">
                        Edit
                      </button>
                    )}
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

export default DocumentSubmissionsList;
