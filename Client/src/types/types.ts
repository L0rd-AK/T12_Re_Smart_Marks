export interface QuestionFormat {
    _id: string;
    name: string;
    questions: Question[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }
  
export interface Question {
    label: string;
    maxMark: number;
  }
  
export interface StudentMarks {
    id: string;
    name?: string;
    studentId: string;
    marks: number[]; // For midterm/final: array of marks per question; For others: single mark in array
    total: number;
    examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'presentation' | 'attendance';
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
    examType: 'quiz' | 'assignment' | 'presentation' | 'attendance';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }