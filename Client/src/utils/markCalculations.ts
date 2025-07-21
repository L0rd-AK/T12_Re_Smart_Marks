import type { AssignmentMarks, PresentationMarks } from '../types/types';

export const ASSIGNMENT_CRITERIA = [
  { key: 'relevantKnowledge', label: 'Relevant Knowledge', maxMark: 1 },
  { key: 'problemStatement', label: 'Defining Problem Statement', maxMark: 1 },
  { key: 'appropriateMethod', label: 'Use of appropriate method/formula', maxMark: 2 },
  { key: 'findingsSolution', label: 'Findings/Solution', maxMark: 1 }
] as const;

export const PRESENTATION_CRITERIA = [
  { key: 'getupOutfit', label: 'Getup and Outfit', maxMark: 0.8 },
  { key: 'bodyLanguage', label: 'Body Language', maxMark: 0.8 },
  { key: 'englishCommunication', label: 'English Communication', maxMark: 0.8 },
  { key: 'eyeContact', label: 'Eye Contact', maxMark: 0.8 },
  { key: 'knowledgeContent', label: 'Knowledge/Content', maxMark: 3.2 },
  { key: 'handlingQA', label: 'Handling Q&A', maxMark: 1.6 }
] as const;

export const MARK_TYPES = [
  { value: 'assignment', label: 'Assignment', maxMark: 5 },
  { value: 'presentation', label: 'Presentation', maxMark: 8 },
  { value: 'quiz', label: 'Quiz', maxMark: 15 },
  { value: 'midterm', label: 'Midterm', maxMark: 25 },
  { value: 'final', label: 'Final', maxMark: 40 }
] as const;

export const calculateAssignmentTotal = (marks: Partial<AssignmentMarks>): number => {
  return Object.values(marks).reduce((sum, mark) => sum + (mark || 0), 0);
};

export const calculatePresentationTotal = (marks: Partial<PresentationMarks>): number => {
  return Object.values(marks).reduce((sum, mark) => sum + (mark || 0), 0);
};

export const validateMarkRange = (mark: number, maxMark: number): boolean => {
  return mark >= 0 && mark <= maxMark;
};

export const formatMark = (mark: number): string => {
  return mark % 1 === 0 ? mark.toString() : mark.toFixed(1);
};

export const calculateQuizAverage = (quizMarks: number[]): number => {
  if (quizMarks.length === 0) return 0;
  const sum = quizMarks.reduce((acc, mark) => acc + mark, 0);
  return sum / quizMarks.length;
};

export const getMarkTypeConfig = (type: string) => {
  return MARK_TYPES.find(markType => markType.value === type);
};

export const getAssignmentCriteriaByIndex = (index: number) => {
  return ASSIGNMENT_CRITERIA[index];
};

export const getPresentationCriteriaByIndex = (index: number) => {
  return PRESENTATION_CRITERIA[index];
};
