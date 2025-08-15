/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
export interface OBEFormData {
    // Course Information
    semester: string;
    courseCode: string;
    courseTitle: string;
    creditHours: string;
    courseSection: string;
    classCount: string;

    // Course Teacher Information
    teacherName: string;
    employeeId: string;
    designation: string;
    emailId: string;
    mobileNumber: string;

    // Document lists
    theoryDocuments: Array<{
        name: string;
        submitted: boolean;
    }>;
    labDocuments: Array<{
        name: string;
        submitted: boolean;
    }>;

    // Submission details
    submittedAt: string;
    completionPercentage: number;
    batch: string;
    department: string;
}

export class PDFService {

    /**
     * Generate OBE File Submission Declaration Form as PDF
     */
    static async generateOBEDeclarationPDF(formData: OBEFormData): Promise<void> {
        try {
            // Create PDF document
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Use direct PDF generation instead of html2canvas to avoid color parsing issues
            this.generatePDFContent(pdf, formData);

            // Download the PDF
            const fileName = `OBE_Declaration_${formData.courseCode}_${formData.semester}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }

    /**
     * Generate PDF content directly using jsPDF
     */
    //   private static generatePDFContent(pdf: jsPDF, data: OBEFormData): void {
    //     let yPosition = 20;
    //     const pageWidth = pdf.internal.pageSize.getWidth();

    //     // Header
    //     pdf.setFontSize(16);
    //     pdf.setFont('helvetica', 'bold');
    //     pdf.text('Daffodil University', pageWidth / 2, yPosition, { align: 'center' });
    //     yPosition += 7;

    //     pdf.setFontSize(12);
    //     pdf.setFont('helvetica', 'normal');
    //     pdf.text('Faculty of Science and Information Technology', pageWidth / 2, yPosition, { align: 'center' });
    //     yPosition += 5;
    //     pdf.text('Department of Computer Science and Engineering', pageWidth / 2, yPosition, { align: 'center' });
    //     yPosition += 5;

    //     pdf.setFont('helvetica', 'bold');
    //     pdf.text('Section Wise OBE File Submission Declaration Form', pageWidth / 2, yPosition, { align: 'center' });
    //     yPosition += 15;

    //     // Course Information Section
    //     pdf.setFontSize(12);
    //     pdf.setFont('helvetica', 'bold');
    //     pdf.text('Course Information', 20, yPosition);
    //     yPosition += 10;

    //     pdf.setFont('helvetica', 'normal');
    //     pdf.setFontSize(10);

    //     // Course info table
    //     const courseInfo = [
    //       ['Semester:', data.semester, 'Course Code:', data.courseCode],
    //       ['Course Title:', data.courseTitle, '', ''],
    //       ['Credit Hours:', data.creditHours, 'Course Section:', data.courseSection],
    //       ['Number of Class Conducted:', data.classCount, 'Batch:', data.batch || 'N/A']
    //     ];

    //     courseInfo.forEach(row => {
    //       pdf.text(row[0], 20, yPosition);
    //       pdf.text(row[1], 70, yPosition);
    //       if (row[2]) {
    //         pdf.text(row[2], 120, yPosition);
    //         pdf.text(row[3], 170, yPosition);
    //       }
    //       yPosition += 7;
    //     });

    //     yPosition += 10;

    //     // Teacher Information Section
    //     pdf.setFontSize(12);
    //     pdf.setFont('helvetica', 'bold');
    //     pdf.text('Course Teacher Information', 20, yPosition);
    //     yPosition += 10;

    //     pdf.setFont('helvetica', 'normal');
    //     pdf.setFontSize(10);

    //     const teacherInfo = [
    //       ['Course Teacher Name with Initial:', data.teacherName],
    //       ['Employee ID:', data.employeeId],
    //       ['Designation:', data.designation],
    //       ['Email:', data.emailId],
    //       ['Mobile Number:', data.mobileNumber]
    //     ];

    //     teacherInfo.forEach(row => {
    //       pdf.text(row[0], 20, yPosition);
    //       pdf.text(row[1], 90, yPosition);
    //       yPosition += 7;
    //     });

    //     yPosition += 10;

    //     // Theory Documents Section
    //     if (data.theoryDocuments.length > 0) {
    //       pdf.setFontSize(12);
    //       pdf.setFont('helvetica', 'bold');
    //       pdf.text('OBE File Submission Checklist (Theory)', 20, yPosition);
    //       yPosition += 10;

    //       pdf.setFont('helvetica', 'normal');
    //       pdf.setFontSize(10);

    //       // Table headers
    //       pdf.setFont('helvetica', 'bold');
    //       pdf.text('Check List (Upload in Section Wise OBE Drive)', 20, yPosition);
    //       pdf.text('Submitted', 160, yPosition);
    //       yPosition += 7;

    //       pdf.setFont('helvetica', 'normal');
    //       data.theoryDocuments.forEach(doc => {
    //         if (yPosition > 260) { // Check if we need a new page
    //           pdf.addPage();
    //           yPosition = 20;
    //         }
    //         pdf.text(doc.name, 20, yPosition);
    //         pdf.text(doc.submitted ? 'Yes' : 'No', 160, yPosition);
    //         yPosition += 6;
    //       });

    //       yPosition += 10;
    //     }

    //     // Lab Documents Section
    //     if (data.labDocuments.length > 0) {
    //       if (yPosition > 200) { // Check if we need a new page
    //         pdf.addPage();
    //         yPosition = 20;
    //       }

    //       pdf.setFontSize(12);
    //       pdf.setFont('helvetica', 'bold');
    //       pdf.text('OBE File Submission Checklist (Lab)', 20, yPosition);
    //       yPosition += 10;

    //       pdf.setFont('helvetica', 'normal');
    //       pdf.setFontSize(10);

    //       // Table headers
    //       pdf.setFont('helvetica', 'bold');
    //       pdf.text('Check List (Upload in Section Wise OBE Drive)', 20, yPosition);
    //       pdf.text('Submitted', 160, yPosition);
    //       yPosition += 7;

    //       pdf.setFont('helvetica', 'normal');
    //       data.labDocuments.forEach(doc => {
    //         if (yPosition > 260) { // Check if we need a new page
    //           pdf.addPage();
    //           yPosition = 20;
    //         }
    //         pdf.text(doc.name, 20, yPosition);
    //         pdf.text(doc.submitted ? 'Yes' : 'No', 160, yPosition);
    //         yPosition += 6;
    //       });
    //     }

    //     // Footer
    //     yPosition = 250; // Fixed position for signature area
    //     pdf.setFontSize(10);
    //     pdf.setFont('helvetica', 'normal');

    //     const currentDate = new Date().toLocaleDateString('en-GB');

    //     pdf.text('_________________________', 20, yPosition);
    //     pdf.text('_________________________', 130, yPosition);
    //     yPosition += 7;
    //     pdf.text('Course Teacher Signature with Date', 20, yPosition);
    //     pdf.text('Checked by Concerned Officer Signature with Date', 130, yPosition);
    //     yPosition += 10;
    //     pdf.text(`Date: ${currentDate}`, 20, yPosition);
    //   }


    private static generatePDFContent(pdf: jsPDF, data: OBEFormData): void {
        const pageWidth = pdf.internal.pageSize.getWidth();

        // ===== HEADER =====
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Faculty of Science and Information Technology', pageWidth / 2, 15, { align: 'center' });
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Department of Computer Science and Engineering', pageWidth / 2, 21, { align: 'center' });
        pdf.text('Section Wise OBE File Submission Declaration Form', pageWidth / 2, 27, { align: 'center' });

        // ===== COURSE INFORMATION =====
        autoTable(pdf, {
            startY: 32,
            head: [['Course Information', '', '', '']],
            headStyles: {
                fillColor: [255, 153, 51], // Orange
                textColor: [0, 0, 0],
                halign: 'left',
                fontStyle: 'bold'
            },
            body: [
                ['Semester', data.semester, 'Course Code', data.courseCode],
                ['Course Title', data.courseTitle, '', ''],
                ['Credit Hours', data.creditHours, 'Course Section', data.courseSection],
                ['Number of Class Conducted', data.classCount, 'Batch', data.batch || 'N/A']
            ],
            styles: { fontSize: 10, cellPadding: 3, lineWidth: 0.5, lineColor: [0, 0, 0] },
            theme: 'grid'
        });

        // ===== TEACHER INFORMATION =====
        autoTable(pdf, {
            startY: (pdf as any).lastAutoTable.finalY + 3,
            head: [['Course Teacher Information', '', '', '']],
            headStyles: {
                fillColor: [255, 153, 51],
                textColor: [0, 0, 0],
                halign: 'left',
                fontStyle: 'bold'
            },
            body: [
                ['Course Teacher Name with Initial', data.teacherName, '', ''],
                ['Employee ID', data.employeeId, '', ''],
                ['Designation', data.designation, '', ''],
                ['Email ID', data.emailId, '', ''],
                ['Mobile Number', data.mobileNumber, '', '']
            ],
            styles: { fontSize: 10, cellPadding: 3, lineWidth: 0.5, lineColor: [0, 0, 0] },
            theme: 'grid'
        });

        // ===== THEORY DOCUMENTS =====
        autoTable(pdf, {
            startY: (pdf as any).lastAutoTable.finalY + 3,
            head: [['OBE File Submission Checklist (Theory)', '', '']],
            headStyles: {
                fillColor: [255, 153, 51],
                textColor: [0, 0, 0],
                halign: 'left',
                fontStyle: 'bold'
            },
            body: [
                ...data.theoryDocuments.map(doc => [doc.name, doc.submitted ? 'Yes' : 'No'])
            ],
            columns: [
                { header: 'Check List (Upload in Section Wise OBE Drive)', dataKey: 'name' },
                { header: 'Submitted (Yes / No)', dataKey: 'submitted' }
            ],
            styles: { fontSize: 10, cellPadding: 3, lineWidth: 0.5, lineColor: [0, 0, 0] },
            theme: 'grid'
        });

        // ===== LAB DOCUMENTS =====
        autoTable(pdf, {
            startY: (pdf as any).lastAutoTable.finalY + 3,
            head: [['OBE File Submission Checklist (Lab)', '', '']],
            headStyles: {
                fillColor: [255, 153, 51],
                textColor: [0, 0, 0],
                halign: 'left',
                fontStyle: 'bold'
            },
            body: [
                ...data.labDocuments.map(doc => [doc.name, doc.submitted ? 'Yes' : 'No'])
            ],
            columns: [
                { header: 'Check List (Upload in Section Wise OBE Drive)', dataKey: 'name' },
                { header: 'Submitted (Yes / No)', dataKey: 'submitted' }
            ],
            styles: { fontSize: 10, cellPadding: 3, lineWidth: 0.5, lineColor: [0, 0, 0] },
            theme: 'grid'
        });

        // ===== FOOTER =====
        let y = (pdf as any).lastAutoTable.finalY + 15;
        pdf.setFontSize(10);
        pdf.text('I hereby declare that I have uploaded all the relevant documents...', 20, y, { maxWidth: pageWidth - 40 });
        y += 20;
        pdf.text('_________________________', 20, y);
        pdf.text('_________________________', 130, y);
        y += 5;
        pdf.text('Course Teacher Signature with Date', 20, y + 5);
        pdf.text('Checked by Concerned Officer Signature with Date', 130, y + 5);
    }

    /**
     * Download PDF from URL or blob
     */
    static downloadPDF(blob: Blob, fileName: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}
