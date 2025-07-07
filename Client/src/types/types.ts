export interface QuestionFormat {
    id: string;
    name: string;
    questions: Question[];
  }
  
export interface Question {
    id: string;
    label: string;
    maxMark: number;
  }
  
export interface StudentMarks {
    id: string;
    name: string;
    marks: number[];
    total: number;
  }