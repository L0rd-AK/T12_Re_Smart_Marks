
import React, { useState } from 'react';
import { toast } from 'sonner';
import type {
  MarkEntryType,
  AssignmentMarks,
  PresentationMarks,
  MarkEntryState
} from '../../types/types';
import {
  useCreateStudentMarksMutation
} from '../../redux/api/marksApi';
import {
  MARK_TYPES,
  ASSIGNMENT_CRITERIA,
  PRESENTATION_CRITERIA
} from '../../utils/markCalculations';
import SectionInformation from '../../components/SectionInformation';
import { useAppSelector } from '../../redux/hooks';
import {
  useGetMidtermTemplatesQuery,
  useGetFinalTemplatesQuery,
  type Template,
  type Question
} from '../../redux/api/questionFormatApi';


const MarksEntry: React.FC = () => {
  const [state, setState] = useState<MarkEntryState>({
    type: null,
    currentStudentId: '',
    currentQuestionNumber: 1,
    questionFormat: null,
    selectedQuizNumber: 1,
    tempMarks: {},
    savedMarks: [],
    quizMarks: {}
  });

  const [inputValue, setInputValue] = useState('');
  const [assignmentMarks, setAssignmentMarks] = useState<Partial<AssignmentMarks>>({});
  const [presentationMarks, setPresentationMarks] = useState<Partial<PresentationMarks>>({});
  const [currentCriteriaIndex, setCurrentCriteriaIndex] = useState(0);
  const [isSelectingFormat, setIsSelectingFormat] = useState(false);
  const [isCreatingFormat, setIsCreatingFormat] = useState(false);
  const [newFormatName, setNewFormatName] = useState('');
  const [newFormatQuestions, setNewFormatQuestions] = useState<Array<{ label: string; maxMark: number }>>([
    { label: '', maxMark: 0 }
  ]);
  const [isAwaitingQuestionNumber, setIsAwaitingQuestionNumber] = useState(false);

  const { isSubmitted, batch, courseCode, courseTitle, department, section, semester, year } = useAppSelector((state) => state.sectionInformation);
  
  const { data: midtermTemplates } = useGetMidtermTemplatesQuery({ courseCode, year });
  const { data: finalTemplates } = useGetFinalTemplatesQuery({ courseCode, year });
  const [createStudentMarks] = useCreateStudentMarksMutation();

  // Get the appropriate question formats based on exam type
  const getQuestionFormats = () => {
    if (state.type === 'midterm') {
      return midtermTemplates?.data || [];
    } else if (state.type === 'final') {
      return finalTemplates?.data || [];
    }
    return [];
  };

  const questionFormats = getQuestionFormats();
  const resetState = () => {
    setState({
      type: null,
      currentStudentId: '',
      currentQuestionNumber: 1,
      questionFormat: null,
      selectedQuizNumber: 1,
      tempMarks: {},
      savedMarks: [],
      quizMarks: {}
    });
    setInputValue('');
    setAssignmentMarks({});
    setPresentationMarks({});
    setCurrentCriteriaIndex(0);
    setIsSelectingFormat(false);
    setIsCreatingFormat(false);
    setNewFormatName('');
    setNewFormatQuestions([{ label: '', maxMark: 0 }]);
    setIsAwaitingQuestionNumber(false);
  };

  const handleMarkTypeSelect = (type: MarkEntryType) => {
    setState(prev => ({ ...prev, type }));

    // Reset relevant states when selecting a mark type
    setCurrentCriteriaIndex(0);
    setAssignmentMarks({});
    setPresentationMarks({});

    if (type === 'midterm' || type === 'final') {
      setIsSelectingFormat(true);
    }
  };

  const handleQuestionFormatSelect = (format: Template) => {
    setState(prev => ({ ...prev, questionFormat: format }));
    setIsSelectingFormat(false);
  };

  const addQuestionToFormat = () => {
    setNewFormatQuestions(prev => [...prev, { label: '', maxMark: 0 }]);
  };

  const removeQuestionFromFormat = (index: number) => {
    if (newFormatQuestions.length > 1) {
      setNewFormatQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateFormatQuestion = (index: number, field: 'label' | 'maxMark', value: string | number) => {
    setNewFormatQuestions(prev =>
      prev.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    );
  };

  // const createNewQuestionFormat = async () => {
  //   if (!newFormatName.trim()) {
  //     toast.error('Please enter a format name');
  //     return;
  //   }

  //   const validQuestions = newFormatQuestions.filter(q => q.label.trim() && q.maxMark > 0);
  //   if (validQuestions.length === 0) {
  //     toast.error('Please add at least one valid question');
  //     return;
  //   }

  //   // Convert questions to proper Question format
  //   const templateQuestions: Question[] = validQuestions.map((q, index) => ({
  //     id: `q${index + 1}`,
  //     questionNo: q.label || `Question ${index + 1}`,
  //     marks: q.maxMark,
  //     courseOutcomeStatements: ''
  //   }));

  //   try {
  //     const result = await createQuestionFormat({
  //       name: newFormatName.trim(),
  //       type: (state.type === 'midterm' || state.type === 'final') ? state.type : 'midterm',
  //       year: year || new Date().getFullYear().toString(),
  //       courseName: courseTitle || '',
  //       courseCode: courseCode || '',
  //       description: `Template for ${state.type} exam`,
  //       duration: 120, // Default 2 hours
  //       instructions: 'Please follow the marking scheme carefully',
  //       isStandard: false,
  //       questions: templateQuestions
  //     }).unwrap();

  //     setState(prev => ({ ...prev, questionFormat: result.data }));
  //     setIsCreatingFormat(false);
  //     setIsSelectingFormat(false);
  //     setNewFormatName('');
  //     setNewFormatQuestions([{ label: '', maxMark: 0 }]);
  //     toast.success('Question format created successfully!');
  //   } catch (error) {
  //     toast.error('Error creating format: ' + (error as Error).message);
  //   }
  // };

  const handleInputSubmit = async () => {
    if (!state.type) return;

    // Handle question number selection mode specifically
    if (isAwaitingQuestionNumber) {
      const questionInput = inputValue.trim();
      
      // Handle save command (0)
      if (questionInput === '0') {
        // Save current student's marks
        if (state.currentStudentId && state.tempMarks[state.currentStudentId]) {
          const marks = state.tempMarks[state.currentStudentId];
          const total = marks.reduce((sum, mark) => sum + mark, 0);

          try {
            await createStudentMarks({
              formatId: state.questionFormat?._id,
              studentId: state.currentStudentId,
              marks,
              examType: state.type as 'midterm' | 'final'
            }).unwrap();

            setState(prev => ({
              ...prev,
              savedMarks: [...prev.savedMarks, {
                studentId: state.currentStudentId,
                marks,
                total
              }],
              currentStudentId: '',
              currentQuestionNumber: 1,
              tempMarks: { ...prev.tempMarks, [state.currentStudentId]: [] }
            }));

            setIsAwaitingQuestionNumber(false);
            toast.success(`${state.type} marks saved successfully!`);
          } catch (error) {
            toast.error('Error saving marks: ' + (error as Error).message);
          }
        } else {
          toast.error('No marks to save for this student.');
        }
        setInputValue('');
        return;
      }
      
      // Find question by questionNo (e.g., "1a", "1b", "2a")
      const questionIndex = state.questionFormat?.questions.findIndex(q => q.questionNo === questionInput);
      if (questionIndex !== undefined && questionIndex >= 0) {
        setState(prev => ({ ...prev, currentQuestionNumber: questionIndex + 1 }));
        setIsAwaitingQuestionNumber(false);
        setInputValue('');
        toast.success(`Switched to question ${questionInput}`);
        return;
      } else {
        const availableQuestions = state.questionFormat?.questions.map(q => q.questionNo).join(', ') || '';
        toast.error(`Please enter a valid question number (${availableQuestions}) or 0 to save`);
        return;
      }
    }

    // Handle student ID input (text) for midterm/final/quiz
    if (!state.currentStudentId && (state.type === 'midterm' || state.type === 'final' || state.type === 'quiz')) {
      setState(prev => ({ ...prev, currentStudentId: inputValue.trim() }));
      
      // For midterm/final exams, immediately switch to question selection mode
      if (state.type === 'midterm' || state.type === 'final') {
        setIsAwaitingQuestionNumber(true);
        toast.success(`Student ID set. Now enter question number (1-${state.questionFormat?.questions.length || 0}) or 0 to save.`);
      }
      
      setInputValue('');
      return;
    }

    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      toast.error('Please enter a valid number');
      return;
    }

    if (state.type === 'quiz') {
      await handleQuizInput(value);
      setInputValue('');
    } else if (state.type === 'midterm' || state.type === 'final') {
      await handleExamInput(value);
      // Only clear input if not switching to question number mode
      if (value !== -1) {
        setInputValue('');
      }
      return;
    } else {
      setInputValue('');
    }
  };

  const handleAssignmentCriteriaInput = (value: number) => {
    // If no student ID is set, this input is for student ID
    if (!state.currentStudentId) {
      setState(prev => ({ ...prev, currentStudentId: inputValue.trim() || value.toString() }));
      setInputValue('');
      return;
    }

    const criteria = ASSIGNMENT_CRITERIA[currentCriteriaIndex];

    // Validate mark range
    if (value < 0 || value > criteria.maxMark) {
      toast.error(`Mark must be between 0 and ${criteria.maxMark}`);
      return;
    }

    const newMarks = { ...assignmentMarks, [criteria.key]: value };
    setAssignmentMarks(newMarks);

    if (currentCriteriaIndex < ASSIGNMENT_CRITERIA.length - 1) {
      setCurrentCriteriaIndex(prev => prev + 1);
    } else {
      // All criteria entered, save marks
      saveAssignmentMarks(newMarks);
    }
    setInputValue('');
  };

  const handlePresentationCriteriaInput = (value: number) => {
    // If no student ID is set, this input is for student ID
    if (!state.currentStudentId) {
      setState(prev => ({ ...prev, currentStudentId: inputValue.trim() || value.toString() }));
      setInputValue('');
      return;
    }

    const criteria = PRESENTATION_CRITERIA[currentCriteriaIndex];

    // Validate mark range
    if (value < 0 || value > criteria.maxMark) {
      toast.error(`Mark must be between 0 and ${criteria.maxMark}`);
      return;
    }

    const newMarks = { ...presentationMarks, [criteria.key]: value };
    setPresentationMarks(newMarks);

    if (currentCriteriaIndex < PRESENTATION_CRITERIA.length - 1) {
      setCurrentCriteriaIndex(prev => prev + 1);
    } else {
      // All criteria entered, save marks
      savePresentationMarks(newMarks);
    }
    setInputValue('');
  };

  const saveAssignmentMarks = async (marks: Partial<AssignmentMarks>) => {
    const total = Object.values(marks).reduce((sum, mark) => sum + (mark || 0), 0);
    const marksArray = ASSIGNMENT_CRITERIA.map(criteria => marks[criteria.key as keyof AssignmentMarks] || 0);

    try {
      await createStudentMarks({
        studentId: state.currentStudentId,
        marks: marksArray,
        examType: 'assignment',
        maxMark: 5
      }).unwrap();

      setState(prev => ({
        ...prev,
        savedMarks: [...prev.savedMarks, {
          studentId: state.currentStudentId,
          marks: marksArray,
          total
        }],
        currentStudentId: ''
      }));

      setAssignmentMarks({});
      setCurrentCriteriaIndex(0);
      toast.success('Assignment marks saved successfully!');
    } catch (error) {
      toast.error('Error saving marks: ' + (error as Error).message);
    }
  };

  const savePresentationMarks = async (marks: Partial<PresentationMarks>) => {
    const total = Object.values(marks).reduce((sum, mark) => sum + (mark || 0), 0);
    const marksArray = PRESENTATION_CRITERIA.map(criteria => marks[criteria.key as keyof PresentationMarks] || 0);

    try {
      await createStudentMarks({
        studentId: state.currentStudentId,
        marks: marksArray,
        examType: 'presentation',
        maxMark: 8
      }).unwrap();

      setState(prev => ({
        ...prev,
        savedMarks: [...prev.savedMarks, {
          studentId: state.currentStudentId,
          marks: marksArray,
          total
        }],
        currentStudentId: ''
      }));

      setPresentationMarks({});
      setCurrentCriteriaIndex(0);
      toast.success('Presentation marks saved successfully!');
    } catch (error) {
      toast.error('Error saving marks: ' + (error as Error).message);
    }
  };

  const handleQuizInput = async (value: number) => {
    if (!state.currentStudentId) {
      // Set student ID - handle as string to support formats like "221-15-343"
      setState(prev => ({ ...prev, currentStudentId: inputValue.trim() || value.toString() }));
    } else {
      // Validate quiz mark range
      if (value < 0 || value > 15) {
        toast.error('Quiz mark must be between 0 and 15');
        return;
      }

      // Automatically save the quiz mark
      const studentQuizData = state.quizMarks[state.currentStudentId] || {};

      // Update the specific quiz mark
      const updatedQuizData = {
        ...studentQuizData,
        [`quiz${state.selectedQuizNumber}`]: value
      };

      // Calculate average if all 3 quizzes are completed
      const quizValues = [updatedQuizData.quiz1, updatedQuizData.quiz2, updatedQuizData.quiz3].filter(val => val !== undefined);
      if (quizValues.length === 3) {
        updatedQuizData.average = quizValues.reduce((sum, val) => sum + (val || 0), 0) / 3;
      }

      try {
        // Save to database
        await createStudentMarks({
          studentId: state.currentStudentId,
          marks: [value],
          examType: 'quiz',
          maxMark: 15
        }).unwrap();

        // Update state and clear current student to ask for new one
        setState(prev => ({
          ...prev,
          quizMarks: {
            ...prev.quizMarks,
            [state.currentStudentId]: updatedQuizData
          },
          currentStudentId: '',
          tempMarks: { ...prev.tempMarks, [state.currentStudentId]: [] }
        }));

        toast.success(`Quiz ${state.selectedQuizNumber} marks saved successfully!`);
      } catch (error) {
        toast.error('Error saving marks: ' + (error as Error).message);
      }
    }
  };

  const handleExamInput = async (value: number) => {
    if (!state.questionFormat) return;

    // Question number selection is now handled in handleInputSubmit
    // This function only handles numeric mark values
    
    if (value === 0) {
      // Save current student's marks
      if (state.currentStudentId && state.tempMarks[state.currentStudentId]) {
        const marks = state.tempMarks[state.currentStudentId];
        const total = marks.reduce((sum, mark) => sum + mark, 0);

        try {
          await createStudentMarks({
            formatId: state.questionFormat._id,
            studentId: state.currentStudentId,
            marks,
            examType: state.type as 'midterm' | 'final'
          }).unwrap();

          setState(prev => ({
            ...prev,
            savedMarks: [...prev.savedMarks, {
              studentId: state.currentStudentId,
              marks,
              total
            }],
            currentStudentId: '',
            currentQuestionNumber: 1,
            tempMarks: { ...prev.tempMarks, [state.currentStudentId]: [] }
          }));

          toast.success(`${state.type} marks saved successfully!`);
        } catch (error) {
          toast.error('Error saving marks: ' + (error as Error).message);
        }
      }
    } else if (value === -1) {
      // Switch to question number input mode
      setIsAwaitingQuestionNumber(true);
      setInputValue('');
      return;
    } else if (!state.currentStudentId) {
      // Set student ID - handle as string to support formats like "221-15-343"
      setState(prev => ({ ...prev, currentStudentId: inputValue.trim() || value.toString() }));
    } else if (state.currentQuestionNumber <= state.questionFormat.questions.length) {
      // Validate mark range for current question
      const currentQuestion = state.questionFormat.questions[state.currentQuestionNumber - 1];
      if (value < 0 || value > currentQuestion.marks) {
        toast.error(`Mark must be between 0 and ${currentQuestion.marks} for this question`);
        return;
      }

      // Enter mark for current question
      const newMarks = [...(state.tempMarks[state.currentStudentId] || [])];
      // Initialize array with zeros if needed
      while (newMarks.length < state.questionFormat.questions.length) {
        newMarks.push(0);
      }
      newMarks[state.currentQuestionNumber - 1] = value;

      setState(prev => ({
        ...prev,
        tempMarks: { ...prev.tempMarks, [state.currentStudentId]: newMarks }
        // Remove auto-increment - user will manually select next question
      }));

      // After entering mark, switch to question selection mode
      setIsAwaitingQuestionNumber(true);
      setInputValue('');
      toast.success(`Mark ${value} entered for Question ${state.currentQuestionNumber}. Enter next question number or 0 to save.`);
      return;
    }
  };

  const getCurrentPrompt = () => {
    if (!state.type) return 'Select a mark entry type';

    if (isSelectingFormat) {
      return 'Select a question format or create a new one';
    }

    switch (state.type) {
      case 'assignment': {
        if (!state.currentStudentId) {
          return 'Enter Student ID:';
        }
        const assignmentCriteria = ASSIGNMENT_CRITERIA[currentCriteriaIndex];
        return `Enter ${assignmentCriteria.label} (Max: ${assignmentCriteria.maxMark}):`;
      }

      case 'presentation': {
        if (!state.currentStudentId) {
          return 'Enter Student ID:';
        }
        const presentationCriteria = PRESENTATION_CRITERIA[currentCriteriaIndex];
        return `Enter ${presentationCriteria.label} (Max: ${presentationCriteria.maxMark}):`;
      }
      case 'quiz':
        if (!state.currentStudentId) {
          return `Quiz ${state.selectedQuizNumber} - Enter Student ID:`;
        }
        return `Quiz ${state.selectedQuizNumber} - Enter mark (will auto-save):`;

      case 'midterm':
      case 'final': {
        if (!state.currentStudentId) {
          return 'Enter Student ID:';
        }
        if (isAwaitingQuestionNumber) {
          const availableQuestions = state.questionFormat?.questions.map(q => q.questionNo).join(', ') || '';
          return `Enter question number (${availableQuestions}) or 0 to save marks:`;
        }
        if (state.currentQuestionNumber <= (state.questionFormat?.questions.length || 0)) {
          const question = state.questionFormat?.questions[state.currentQuestionNumber - 1];
          return `Q${question?.questionNo}: ${question?.questionNo} (Max: ${question?.marks} marks) - Enter mark:`;
        }
        const availableQuestions = state.questionFormat?.questions.map(q => q.questionNo).join(', ') || '';
        return `Enter question number (${availableQuestions}) or 0 to save marks:`;
      }

      default:
        return '';
    }
  };

  const renderMarksTable = () => {
    if (state.type === 'quiz') {
      // Special handling for quiz marks
      const quizEntries = Object.entries(state.quizMarks);
      if (quizEntries.length === 0) return null;

      return (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quiz Marks</h3>
            <div className="text-sm text-gray-600">
              Total Students: {quizEntries.length} | Max Marks: 15 per quiz
            </div>
          </div>

          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 border-b text-left font-semibold text-gray-900">Student ID</th>
                  <th className="px-4 py-3 border-b text-center font-semibold text-gray-900">
                    Quiz 1<div className="text-xs text-gray-500">(15)</div>
                  </th>
                  <th className="px-4 py-3 border-b text-center font-semibold text-gray-900">
                    Quiz 2<div className="text-xs text-gray-500">(15)</div>
                  </th>
                  <th className="px-4 py-3 border-b text-center font-semibold text-gray-900">
                    Quiz 3<div className="text-xs text-gray-500">(15)</div>
                  </th>
                  <th className="px-4 py-3 border-b text-center font-semibold bg-blue-50 text-gray-900">
                    Average<div className="text-xs text-gray-500">(15)</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {quizEntries.map(([studentId, quizData], index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-b font-medium text-gray-900">{studentId}</td>
                    <td className="px-4 py-3 border-b text-center text-gray-900">
                      {quizData.quiz1 !== undefined ? quizData.quiz1 : '-'}
                    </td>
                    <td className="px-4 py-3 border-b text-center text-gray-900">
                      {quizData.quiz2 !== undefined ? quizData.quiz2 : '-'}
                    </td>
                    <td className="px-4 py-3 border-b text-center text-gray-900">
                      {quizData.quiz3 !== undefined ? quizData.quiz3 : '-'}
                    </td>
                    <td className="px-4 py-3 border-b text-center font-semibold bg-blue-50 text-gray-900">
                      {quizData.average !== undefined ? quizData.average.toFixed(2) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Original table for other mark types
    if (state.savedMarks.length === 0) return null;

    const maxMarks = state.type === 'assignment' ? 5 :
      state.type === 'presentation' ? 8 :
        state.questionFormat?.questions.reduce((sum, q) => sum + q.marks, 0) || 0;

    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Saved Marks - {state.type?.toUpperCase()}</h3>
          <div className="text-sm text-gray-600">
            Total Students: {state.savedMarks.length} | Max Marks: {maxMarks}
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-900">Student ID</th>
                {state.type === 'assignment' && ASSIGNMENT_CRITERIA.map((criteria, index) => (
                  <th key={index} className="px-4 py-3 border-b text-center font-semibold text-gray-900">
                    {criteria.label}
                    <div className="text-xs text-gray-500">({criteria.maxMark})</div>
                  </th>
                ))}
                {state.type === 'presentation' && PRESENTATION_CRITERIA.map((criteria, index) => (
                  <th key={index} className="px-4 py-3 border-b text-center font-semibold text-gray-900">
                    {criteria.label}
                    <div className="text-xs text-gray-500">({criteria.maxMark})</div>
                  </th>
                ))}
                {(state.type === 'midterm' || state.type === 'final') && state.questionFormat?.questions.map((question, index) => (
                  <th key={index} className="px-4 py-3 border-b text-center font-semibold text-gray-900">
                    {question?.courseOutcomeStatements}({question?.questionNo})
                    <div className="text-xs text-gray-500">({question.marks})</div>
                  </th>
                ))}
                <th className="px-4 py-3 border-b text-center font-semibold bg-blue-50 text-gray-900">
                  Total
                  <div className="text-xs text-gray-500">({maxMarks})</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {state.savedMarks.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border-b font-medium text-gray-900">{entry.studentId}</td>
                  {entry.marks.map((mark, markIndex) => (
                    <td key={markIndex} className="px-4 py-3 border-b text-center text-gray-900">{mark}</td>
                  ))}
                  <td className="px-4 py-3 border-b text-center font-semibold bg-blue-50 text-gray-900">
                    {entry.total.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        {state.savedMarks.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-2 text-gray-900">Summary Statistics:</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Average:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {(state.savedMarks.reduce((sum, entry) => sum + entry.total, 0) / state.savedMarks.length).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Highest:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {Math.max(...state.savedMarks.map(entry => entry.total)).toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Lowest:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {Math.min(...state.savedMarks.map(entry => entry.total)).toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Pass Rate:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {((state.savedMarks.filter(entry => entry.total >= maxMarks * 0.6).length / state.savedMarks.length) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


console.log("midterm templates:", midtermTemplates?.data);
console.log("final templates:", finalTemplates?.data);
console.log("current type:", state.type);
console.log("questionFormats:", questionFormats);

  return (
    <div className="p-6  bg-white min-h-screen">
      <div className="container mx-auto ">

      {
        state.type == null ?
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Marks Entry System</h1> :
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Marks Entry System of {state.type.toUpperCase()}</h1>
      }

      <p className="text-gray-600 mb-6">
        Select the type of marks you want to enter and follow the guided process.
      </p>

      {/* Instructions */}
      {!state.type && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg collapse collapse-plus">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Instructions:</h2>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li><strong>Assignment (5 marks):</strong>
              <br />• Enter Student ID → Relevant Knowledge (1) → Problem Statement (1) → Method/Formula (2) → Findings/Solution (1) → 0 to save
            </li>
            <li><strong>Presentation (8 marks):</strong>
              <br />• Enter Student ID → Getup/Outfit (0.8) → Body Language (0.8) → English (0.8) → Eye Contact (0.8) → Knowledge (3.2) → Q&A (1.6) → 0 to save
            </li>
            <li><strong>Quiz (15 marks each):</strong>
              <br />• Select quiz number (1-3) → Enter Student ID → Enter mark (auto-saves and asks for next student)
            </li>
            <li><strong>Midterm/Final (25/40 marks):</strong>
              <br />• Select question format → Enter Student ID → Enter Question Number → 0 to save student
            </li>
          </ul>
          <div className="mt-3 p-3 bg-blue-100 rounded">
            <p className="text-blue-800 text-sm font-medium">
              ⚠️ Key Commands: Enter <strong>0</strong> to save current student (exams only)
            </p>
          </div>
        </div>
      )}
      {/* section information */}
      {
        !isSubmitted &&
        <SectionInformation  from={"mark-entry"} />
      }
      {
        isSubmitted && <section>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Batch:</p>
                <p className="font-medium text-gray-900">{batch}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Course Code:</p>
                <p className="font-medium text-gray-900">{courseCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Course Title:</p>
                <p className="font-medium text-gray-900">{courseTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department:</p>
                <p className="font-medium text-gray-900">{department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Section:</p>
                <p className="font-medium text-gray-900">{section}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Semester:</p>
                <p className="font-medium text-gray-900">{semester}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year:</p>
                <p className="font-medium text-gray-900">{year}</p>
              </div>
            </div>
          </div>
        </section>
      }
      {/* Mark Type Selection */}
      {isSubmitted && !state.type && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Select Mark Entry Type:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {MARK_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleMarkTypeSelect(type.value)}
                className="p-4 shadow border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors bg-white"
              >
                <div className="font-medium text-gray-900">{type.label}</div>
                <div className="text-sm text-gray-600">({type.maxMark} marks)</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question Format Selection for Midterm/Final */}
      {isSelectingFormat && (state.type === 'midterm' || state.type === 'final') && !isCreatingFormat && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Select {state.type === 'midterm' ? 'Midterm' : 'Final'} Question Format:
          </h2>
          <div className="space-y-2 mb-4">
            {questionFormats
              ?.filter((format: Template) => {
                if (state.type === 'midterm') {
                  return format.type=='midterm';
                } else if (state.type === 'final') {
                  return format.type=='final';
                }
                return false;
              })
              ?.map((format: Template) => (
                <button
                  key={format._id}
                  onClick={() => handleQuestionFormatSelect(format)}
                  className="block w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors bg-white"
                >
                  <div className="font-medium text-gray-900">{format.name}</div>
                  <div className="text-sm text-gray-600">
                    {format.questions.length} questions - Total: {format.questions.reduce((sum: number, q: Question) => sum + q.marks, 0)} marks
                  </div>
                </button>
              ))}
            {questionFormats
              ?.filter((format: Template) => {
                if (state.type === 'midterm') {
                  return format.type=='midterm';
                } else if (state.type === 'final') {
                  return format.type=='final';
                }
                return false;
              })?.length === 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    No {state.type} question formats found. Create a new format with "{state.type}" in the name,
                    or create a format below.
                  </p>
                </div>
              )}
          </div>

          <div className="border-t pt-4">
            <div className="flex gap-2">
              <button
                onClick={() => setIsCreatingFormat(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Create New Format
              </button>
              <button
                onClick={() => setIsSelectingFormat(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Question Format */}
      {isCreatingFormat && (state.type === 'midterm' || state.type === 'final') && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Create New Question Format:</h2>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            {/* Format Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Format Name:</label>
              <input
                type="text"
                value={newFormatName}
                onChange={(e) => setNewFormatName(e.target.value)}
                placeholder={`Enter format name (e.g., ${state.type === 'midterm' ? 'Midterm' : 'Final'} Exam Format)`}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Include "{state.type}" in the name to make it appear in {state.type} format selection.
              </p>
            </div>

            {/* Questions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Questions:</label>
              <div className="space-y-3">
                {newFormatQuestions.map((question, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={question.label}
                        onChange={(e) => updateFormatQuestion(index, 'label', e.target.value)}
                        placeholder={`Question ${index + 1} description`}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      />
                    </div>
                    <div className="w-20">
                      <input
                        type="number"
                        value={question.maxMark || ''}
                        onChange={(e) => updateFormatQuestion(index, 'maxMark', parseInt(e.target.value) || 0)}
                        placeholder="Marks"
                        min="0"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      />
                    </div>
                    {newFormatQuestions.length > 1 && (
                      <button
                        onClick={() => removeQuestionFromFormat(index)}
                        className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Remove question"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addQuestionToFormat}
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Add Question
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                // onClick={createNewQuestionFormat}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Create Format
              </button>
              <button
                onClick={() => {
                  setIsCreatingFormat(false);
                  setNewFormatName('');
                  setNewFormatQuestions([{ label: '', maxMark: 0 }]);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Preview */}
            {newFormatName && newFormatQuestions.some(q => q.label && q.maxMark > 0) && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-900">{newFormatName}</div>
                  <div className="text-sm text-gray-600">
                    {newFormatQuestions.filter(q => q.label && q.maxMark > 0).length} questions -
                    Total: {newFormatQuestions.reduce((sum, q) => sum + (q.maxMark || 0), 0)} marks
                  </div>
                  <ul className="mt-2 text-sm text-gray-700">
                    {newFormatQuestions.map((q, i) =>
                      q.label && q.maxMark > 0 ? (
                        <li key={i}>Q{i + 1}: {q.label} ({q.maxMark} marks)</li>
                      ) : null
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Number Selection */}
      {state.type === 'quiz' && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Select Quiz Number:</h2>
          <div className="flex gap-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setState(prev => ({ ...prev, selectedQuizNumber: num }))}
                className={`px-4 py-2 rounded transition-colors ${state.selectedQuizNumber === num
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
              >
                Quiz {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Section */}
      {state.type && !isSelectingFormat && (
        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
            <p className="font-medium text-blue-900">{getCurrentPrompt()}</p>
          </div>

          <div className="flex gap-2">
            <input
              type={
                // Use text input for student ID entry
                (!state.currentStudentId && (state.type === 'midterm' || state.type === 'final' || state.type === 'quiz' || state.type === 'assignment' || state.type === 'presentation')) ||
                // Use text input when waiting for question number (to allow 1a, 1b, 2a, etc.)
                isAwaitingQuestionNumber
                  ? "text" 
                  : "number"
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                !state.currentStudentId && (state.type === 'midterm' || state.type === 'final' || state.type === 'quiz' || state.type === 'assignment' || state.type === 'presentation') 
                  ? "Enter Student ID" 
                  : isAwaitingQuestionNumber 
                    ? "Enter question number (e.g., 1a, 1b, 2a) or 0 to save"
                    : "Enter value"
              }
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (state.type === 'assignment') {
                    handleAssignmentCriteriaInput(parseFloat(inputValue) || 0);
                  } else if (state.type === 'presentation') {
                    handlePresentationCriteriaInput(parseFloat(inputValue) || 0);
                  } else {
                    handleInputSubmit();
                  }
                }
              }}
            />
            <button
              onClick={() => {
                if (state.type === 'assignment') {
                  handleAssignmentCriteriaInput(parseFloat(inputValue) || 0);
                } else if (state.type === 'presentation') {
                  handlePresentationCriteriaInput(parseFloat(inputValue) || 0);
                } else {
                  handleInputSubmit();
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={resetState}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Reset All
            </button>

            {state.currentStudentId && (
              <>
                <button
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      currentStudentId: '',
                      currentQuestionNumber: 1,
                      tempMarks: { ...prev.tempMarks, [state.currentStudentId]: [] }
                    }));
                    setIsAwaitingQuestionNumber(false);
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                >
                  New Student
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear current student data?')) {
                      setState(prev => ({
                        ...prev,
                        currentStudentId: '',
                        currentQuestionNumber: 1,
                        tempMarks: { ...prev.tempMarks, [state.currentStudentId]: [] }
                      }));
                      setAssignmentMarks({});
                      setPresentationMarks({});
                      setCurrentCriteriaIndex(0);
                      setIsAwaitingQuestionNumber(false);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Clear Current
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Current Status */}
      {state.currentStudentId && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Current Entry:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-green-700"><strong>Student ID:</strong> {state.currentStudentId}</p>
              {(state.type === 'midterm' || state.type === 'final') && (
                <p className="text-green-700">
                  <strong>Current Question:</strong> {state.questionFormat?.questions[state.currentQuestionNumber - 1]?.questionNo || state.currentQuestionNumber} / {state.questionFormat?.questions.length || 0}
                  {isAwaitingQuestionNumber && (
                    <span className="ml-2 text-orange-600 font-bold">(Enter question number like 1a, 1b, 2a, etc.)</span>
                  )}
                  {!isAwaitingQuestionNumber && state.currentQuestionNumber <= (state.questionFormat?.questions.length || 0) && (
                    <span className="ml-2 text-sm">
                      (Max: {state.questionFormat?.questions[state.currentQuestionNumber - 1]?.marks} marks)
                    </span>
                  )}
                </p>
              )}
              {state.type === 'quiz' && (
                <div>
                  <p className="text-green-700"><strong>Quiz:</strong> {state.selectedQuizNumber}</p>
                  {state.quizMarks[state.currentStudentId] && (
                    <div className="mt-2">
                      <p className="text-green-600 text-sm"><strong>Previous Quiz Marks:</strong></p>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(quizNum => (
                          <span key={quizNum} className="text-xs bg-green-100 px-2 py-1 rounded">
                            Q{quizNum}: {state.quizMarks[state.currentStudentId][`quiz${quizNum}` as keyof typeof state.quizMarks[string]] || '-'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {state.tempMarks[state.currentStudentId] && state.tempMarks[state.currentStudentId].length > 0 && (
              <div>
                <p className="text-green-700"><strong>Current Marks:</strong></p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {state.tempMarks[state.currentStudentId].map((mark, index) => {
                    const questionNo = state.questionFormat?.questions[index]?.questionNo || (index + 1).toString();
                    return (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {state.type === 'quiz' ? `Mark: ${mark}` : `${questionNo}: ${mark}`}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignment Progress */}
      {state.type === 'assignment' && state.currentStudentId && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Assignment Progress:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ASSIGNMENT_CRITERIA.map((criteria, index) => (
              <div key={criteria.key} className={`p-2 rounded ${index < currentCriteriaIndex ? 'bg-green-100 text-green-800' :
                index === currentCriteriaIndex ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                <span className="font-medium">{criteria.label}</span>
                <span className="text-sm ml-2">({criteria.maxMark} marks)</span>
                {assignmentMarks[criteria.key as keyof AssignmentMarks] !== undefined && (
                  <span className="float-right font-semibold">
                    {assignmentMarks[criteria.key as keyof AssignmentMarks]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Presentation Progress */}
      {state.type === 'presentation' && state.currentStudentId && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-2">Presentation Progress:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESENTATION_CRITERIA.map((criteria, index) => (
              <div key={criteria.key} className={`p-2 rounded ${index < currentCriteriaIndex ? 'bg-green-100 text-green-800' :
                index === currentCriteriaIndex ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                <span className="font-medium">{criteria.label}</span>
                <span className="text-sm ml-2">({criteria.maxMark} marks)</span>
                {presentationMarks[criteria.key as keyof PresentationMarks] !== undefined && (
                  <span className="float-right font-semibold">
                    {presentationMarks[criteria.key as keyof PresentationMarks]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marks Table */}
      {renderMarksTable()}
      </div>
    </div>
  );
};

export default MarksEntry;