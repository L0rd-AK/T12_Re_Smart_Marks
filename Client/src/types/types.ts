// Import Template type from questionFormatApi for better type safety
import type { Template } from '../redux/api/questionFormatApi';

export interface QuestionFormat {
    _id: string;
    id: string;
    name: string;
    questions: Question[];
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
  }
  
export interface Question {
    label: string;
    maxMark: number;
    course_outcome: string;
  }
  
export interface StudentMarks {
    id: string;
    name?: string;
    studentId: string;
    marks: number[]; // For midterm/final: array of marks per question; For others: single mark in array
    total: number;
    examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'presentation' ;
    formatId?: string; // Optional - only for midterm/final
    maxMark?: number; // For quiz/assignment/presentation - the maximum possible mark
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }

export interface SimpleMarkEntry {
    id: string;
    studentId: string;
    name: string;
    mark: number;
    maxMark: number;
    examType: 'quiz' | 'assignment' | 'presentation' ;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }

// Mark Entry Types
export type MarkEntryType = 'assignment' | 'presentation' | 'quiz' | 'midterm' | 'final';

export interface AssignmentMarks {
  relevantKnowledge: number; // 1 mark
  problemStatement: number; // 1 mark
  appropriateMethod: number; // 2 marks
  findingsSolution: number; // 1 mark
}

export interface PresentationMarks {
  getupOutfit: number; // 0.8 marks
  bodyLanguage: number; // 0.8 marks
  englishCommunication: number; // 0.8 marks
  eyeContact: number; // 0.8 marks
  knowledgeContent: number; // 3.2 marks
  handlingQA: number; // 1.6 marks
}

export interface QuizEntry {
  studentId: string;
  mark: number;
}

export interface StudentMarkEntry {
  studentId: string;
  marks: number[];
  total: number;
}

export interface MarkEntryState {
  type: MarkEntryType | null;
  currentStudentId: string;
  currentQuestionNumber: number;
  questionFormat: Template | null; // Use proper Template type instead of any
  selectedQuizNumber: number;
  tempMarks: { [key: string]: number[] };
  savedMarks: StudentMarkEntry[];
  quizMarks: { [studentId: string]: { quiz1?: number; quiz2?: number; quiz3?: number; average?: number } };
}

export interface ProfileFormData {
  name: string;
  email: string;
  employeeId?: string;
  designation?: string;
  emailId?: string;
  mobileNumber?: string;
  roomNumber?: string;
  initial?: string;
}

export interface TeacherCourseRequest {
  _id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  employeeId: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  batch: string;
  department: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
}

export interface ModuleLeaderDocumentSubmission {
  _id: string;
  submissionId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  employeeId: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  batch: string;
  department: string;
  submissionStatus: 'draft' | 'partial' | 'complete' | 'submitted';
  overallStatus: 'pending' | 'approved' | 'rejected' | 'in-review';
  completionPercentage: number;
  submittedAt?: string;
  lastModifiedAt: string;
  reviewComments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}