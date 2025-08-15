import React, { useState } from 'react';
import { PDFService } from '../services/pdfService';
import type { OBEFormData } from '../services/pdfService';
import toast from 'react-hot-toast';

interface PDFGeneratorProps {
  submissionData: {
    courseInfo: {
      semester: string;
      courseCode: string;
      courseTitle: string;
      creditHours: string;
      courseSection: string;
      classCount: string;
      batch: string;
      department: string;
    };
    teacherInfo: {
      teacherName: string;
      employeeId: string;
      designation: string;
      emailId: string;
      mobileNumber: string;
    };
    documents: {
      theory: Array<{
        id: string;
        name: string;
        status: 'yes' | 'no' | 'pending';
      }>;
      lab: Array<{
        id: string;
        name: string;
        status: 'yes' | 'no' | 'pending';
      }>;
    };
    completionPercentage: number;
    submittedAt?: string;
  };
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ submissionData }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Prepare data for PDF generation
      const formData: OBEFormData = {
        // Course Information
        semester: submissionData.courseInfo.semester,
        courseCode: submissionData.courseInfo.courseCode,
        courseTitle: submissionData.courseInfo.courseTitle,
        creditHours: submissionData.courseInfo.creditHours,
        courseSection: submissionData.courseInfo.courseSection,
        classCount: submissionData.courseInfo.classCount,
        batch: submissionData.courseInfo.batch,
        department: submissionData.courseInfo.department,
        
        // Teacher Information
        teacherName: submissionData.teacherInfo.teacherName,
        employeeId: submissionData.teacherInfo.employeeId,
        designation: submissionData.teacherInfo.designation,
        emailId: submissionData.teacherInfo.emailId,
        mobileNumber: submissionData.teacherInfo.mobileNumber,
        
        // Document Lists
        theoryDocuments: submissionData.documents.theory.map(doc => ({
          name: doc.name,
          submitted: doc.status === 'yes'
        })),
        labDocuments: submissionData.documents.lab.map(doc => ({
          name: doc.name,
          submitted: doc.status === 'yes'
        })),
        
        // Submission Details
        submittedAt: submissionData.submittedAt || new Date().toISOString(),
        completionPercentage: submissionData.completionPercentage,
      };
      
      // Generate PDF
      await PDFService.generateOBEDeclarationPDF(formData);
      
      toast.success('OBE Declaration Form PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-green-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">
            Submission Completed Successfully!
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>
              Your documents have been submitted for review. You can now download the
              OBE File Submission Declaration Form as a PDF for your records.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download OBE Declaration Form (PDF)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;
