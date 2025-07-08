import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { QuestionFormat, Question, StudentMarks } from '../../types/types';

const FinalMarks: React.FC = () => {
  const [questionFormats, setQuestionFormats] = useState<QuestionFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<QuestionFormat | null>(null);
  const [students, setStudents] = useState<StudentMarks[]>([]);
  const [currentStudentName, setCurrentStudentName] = useState('');
  const [currentMarksInput, setCurrentMarksInput] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(true);
  const [newFormatName, setNewFormatName] = useState('');
  const [newQuestions, setNewQuestions] = useState<Question[]>([]);
  const [editingCell, setEditingCell] = useState<{ studentId: string; markIndex: number } | null>(null);

// Load saved formats from localStorage on component mount
  useEffect(() => {
    const savedFormats = localStorage.getItem('finalQuestionFormats');
    if (savedFormats) {
      setQuestionFormats(JSON.parse(savedFormats));
    }
  }, []);


  // Save formats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('finalQuestionFormats', JSON.stringify(questionFormats));
  }, [questionFormats]);

  const createSimpleFormat = () => {
    const format: QuestionFormat = {
      id: Date.now().toString(),
      name: 'Simple Format (5 questions, 10 marks each)',
      questions: [
        { id: '1', label: '1', maxMark: 10 },
        { id: '2', label: '2', maxMark: 10 },
        { id: '3', label: '3', maxMark: 10 },
        { id: '4', label: '4', maxMark: 10 },
        { id: '5', label: '5', maxMark: 10 },
      ]
    };
    setQuestionFormats(prev => [...prev, format]);
    setSelectedFormat(format);
    localStorage.setItem('selectedFinalFormat', JSON.stringify(format));
    setIsSetupMode(false);
    toast.success('Simple format created successfully!');
  };



  const createSubQuestionFormat = () => {
    const format: QuestionFormat = {
      id: Date.now().toString(),
      name: 'Sub-question Format',
      questions: [
        { id: '1a', label: '1a', maxMark: 6 },
        { id: '1b', label: '1b', maxMark: 4 },
        { id: '2a', label: '2a', maxMark: 6 },
        { id: '2b', label: '2b', maxMark: 4 },
        { id: '3', label: '3', maxMark: 10 },
        { id: '4', label: '4', maxMark: 10 },
        { id: '5', label: '5', maxMark: 10 },
      ]
    };
    setQuestionFormats(prev => [...prev, format]);
    setSelectedFormat(format);
    localStorage.setItem('selectedFinalFormat', JSON.stringify(format));
    setIsSetupMode(false);
    toast.success('Sub-question format created successfully!');
  };


  const addCustomFormat = () => {
    if (!newFormatName.trim() || newQuestions.length === 0) {
      toast.error('Please provide a format name and at least one question');
      return;
    }

    const format: QuestionFormat = {
      id: Date.now().toString(),
      name: newFormatName,
      questions: newQuestions
    };
    setQuestionFormats(prev => [...prev, format]);
    setSelectedFormat(format);
    localStorage.setItem('selectedFinalFormat', JSON.stringify(format));
    setIsSetupMode(false);
    setNewFormatName('');
    setNewQuestions([]);
    toast.success('Custom format created successfully!');
  };




  const addQuestion = () => {
    const question: Question = {
      id: `q${newQuestions.length + 1}`,
      label: `Q${newQuestions.length + 1}`,
      maxMark: 10
    };
    setNewQuestions(prev => [...prev, question]);
  };



  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    setNewQuestions(prev => prev.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    ));
  };




  const removeQuestion = (index: number) => {
    setNewQuestions(prev => prev.filter((_, i) => i !== index));
  };


  const parseMarksInput = (input: string): number[] => {
    return input.trim().split(/\s+/).map(mark => {
      const num = parseFloat(mark);
      return isNaN(num) ? 0 : num;
    });
  };

  const validateMarks = (marks: number[], format: QuestionFormat): string | null => {
    if (marks.length !== format.questions.length) {
      return `Expected ${format.questions.length} marks, got ${marks.length}`;
    }

    for (let i = 0; i < marks.length; i++) {
      if (marks[i] < 0 || marks[i] > format.questions[i].maxMark) {
        return `Mark for question ${format.questions[i].label} should be between 0 and ${format.questions[i].maxMark}`;
      }
    }

    return null;
  };


  const addStudentMarks = () => {
    if (!selectedFormat || !currentStudentName.trim() || !currentMarksInput.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const marks = parseMarksInput(currentMarksInput);
    const validationError = validateMarks(marks, selectedFormat);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const total = marks.reduce((sum, mark) => sum + mark, 0);
    const student: StudentMarks = {
      id: Date.now().toString(),
      name: currentStudentName,
      marks,
      total
    };

    setStudents(prev => [...prev, student]);
    setCurrentStudentName('');
    setCurrentMarksInput('');
    toast.success(`Student ${currentStudentName} added successfully!`);
  };


  const removeStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const updateStudentMark = (studentId: string, markIndex: number, newMark: number) => {
    if (!selectedFormat) return;

    const maxMark = selectedFormat.questions[markIndex].maxMark;
    if (newMark < 0 || newMark > maxMark) {
      toast.error(`Mark should be between 0 and ${maxMark}`);
      return;
    }

    setStudents(prev => prev.map(student => {
      if (student.id === studentId) {
        const updatedMarks = [...student.marks];
        updatedMarks[markIndex] = newMark;
        const newTotal = updatedMarks.reduce((sum, mark) => sum + mark, 0);
        return { ...student, marks: updatedMarks, total: newTotal };
      }
      return student;
    }));

    setEditingCell(null);
    toast.success('Mark updated successfully!');
  };


  const exportToExcel = () => {
    if (!selectedFormat || students.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Prepare data for Excel
    const excelData = students.map(student => {
      const row: Record<string, string | number> = {
        'Student Name': student.name,
        'Total': student.total
      };

      // Add individual question marks
      selectedFormat.questions.forEach((question, index) => {
        row[`Q${question.label}`] = student.marks[index];
      });

      return row;
    });



    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Student Name
      ...selectedFormat.questions.map(() => ({ wch: 10 })), // Question columns
      { wch: 10 } // Total column
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Final Marks');

    // Generate and download file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `final-marks-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file exported successfully!');
  };


  const clearAllData = () => {
    const promise = new Promise((resolve, reject) => {
      const confirmed = window.confirm('Are you sure you want to clear all data? This action cannot be undone.');
      if (confirmed) {
        setStudents([]);
        setSelectedFormat(null);
        setIsSetupMode(true);
        resolve('Data cleared successfully');
      } else {
        reject('Operation cancelled');
      }
    });

    toast.promise(promise, {
      loading: 'Clearing data...',
      success: 'All data cleared successfully!',
      error: 'Operation cancelled'
    });
  };


  const selectExistingFormat = (format: QuestionFormat) => {
    setSelectedFormat(format);
    localStorage.setItem('selectedFinalFormat', JSON.stringify(format));
    setIsSetupMode(false);
    toast.success(`Format "${format.name}" selected!`);
  };


  if (isSetupMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 text-black">
        <Toaster position="bottom-right" />
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Final Marks Setup</h1>

            {/* Quick Format Options */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Quick Setup Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={createSimpleFormat}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h3 className="font-semibold text-lg mb-2">Simple Format</h3>
                  <p className="text-gray-600">5 questions, 10 marks each (Total: 50)</p>
                </button>
                <button
                  onClick={createSubQuestionFormat}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h3 className="font-semibold text-lg mb-2">Sub-question Format</h3>
                  <p className="text-gray-600">Questions with sub-parts (Total: 50)</p>
                </button>
              </div>
            </div>

            {/* Saved Formats */}
            {questionFormats.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Saved Formats</h2>
                <div className="space-y-2">
                  {questionFormats.map(format => (
                    <div key={format.id} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{format.name}</h3>
                        <p className="text-sm text-gray-600">
                          {format.questions.length} questions, Total: {format.questions.reduce((sum, q) => sum + q.maxMark, 0)} marks
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectExistingFormat(format)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => deleteFormat(format.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Format Creation */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Create Custom Format</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format Name
                  </label>
                  <input
                    type="text"
                    value={newFormatName}
                    onChange={(e) => setNewFormatName(e.target.value)}
                    placeholder="Enter format name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Questions
                    </label>
                    <button
                      onClick={addQuestion}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      Add Question
                    </button>
                  </div>

                  {newQuestions.map((question, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={question.label}
                        onChange={(e) => updateQuestion(index, 'label', e.target.value)}
                        placeholder="Question label"
                        className="flex-1 p-2 border border-gray-300 rounded text-black"
                      />
                      <input
                        type="number"
                        value={question.maxMark}
                        onChange={(e) => updateQuestion(index, 'maxMark', parseInt(e.target.value) || 0)}
                        placeholder="Max marks"
                        min="1"
                        className="w-24 p-2 border border-gray-300 rounded text-black"
                      />
                      <button
                        onClick={() => removeQuestion(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addCustomFormat}
                  className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!newFormatName.trim() || newQuestions.length === 0}
                >
                  Create Custom Format
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <Toaster position="bottom-right" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-black">
          <div className="mb-4 flex justify-end">
            <a href="/final-shortcut" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Go to Shortcut Entry</a>
          </div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Final Marks Entry</h1>
              <p className="text-gray-600">Format: {selectedFormat?.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsSetupMode(true)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Change Format
              </button>
              <button
                onClick={clearAllData}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Question Format Display */}
          {selectedFormat && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Question Format:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {selectedFormat.questions.map(question => (
                  <div key={question.id} className="text-center p-2 bg-white rounded border">
                    <div className="font-medium">{question.label}</div>
                    <div className="text-sm text-gray-600">Max: {question.maxMark}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mark Entry Form */}
          <div className="mb-8 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Add Student Marks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  value={currentStudentName}
                  onChange={(e) => setCurrentStudentName(e.target.value)}
                  placeholder="Enter student ID"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marks (space-separated)
                </label>
                <input
                  type="text"
                  value={currentMarksInput}
                  onChange={(e) => setCurrentMarksInput(e.target.value)}
                  placeholder={`e.g., ${selectedFormat?.questions.map(q => q.maxMark).join(' ')}`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addStudentMarks}
                  className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Student
                </button>
              </div>
            </div>
            {selectedFormat && (
              <p className="text-sm text-gray-600 mt-2">
                Expected format: {selectedFormat.questions.map(q => `${q.label}(${q.maxMark})`).join(' ')}
              </p>
            )}
          </div>

          {/* Students Table */}
          {students.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Student Marks ({students.length} students)</h3>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Export to Excel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Student ID</th>
                      {selectedFormat?.questions.map(question => (
                        <th key={question.id} className="border border-gray-300 p-2 text-center">
                          {question.label}
                        </th>
                      ))}
                      <th className="border border-gray-300 p-2 text-center font-bold">Total</th>
                      <th className="border border-gray-300 p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 font-medium">{student.name}</td>
                        {student.marks.map((mark, index) => (
                          <td key={index} className="border border-gray-300 p-2 text-center">
                            {editingCell && editingCell.studentId === student.id && editingCell.markIndex === index ? (
                              <input
                                type="number"
                                defaultValue={mark}
                                min="0"
                                max={selectedFormat?.questions[index].maxMark}
                                className="w-full p-1 text-center border border-gray-300 rounded text-black"
                                autoFocus
                                onBlur={(e) => {
                                  const newMark = parseFloat(e.target.value) || 0;
                                  updateStudentMark(student.id, index, newMark);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newMark = parseFloat((e.target as HTMLInputElement).value) || 0;
                                    updateStudentMark(student.id, index, newMark);
                                  } else if (e.key === 'Escape') {
                                    setEditingCell(null);
                                  }
                                }}
                              />
                            ) : (
                              <button
                                onClick={() => setEditingCell({ studentId: student.id, markIndex: index })}
                                className="w-full h-full p-1 hover:bg-blue-100 transition-colors rounded"
                                title="Click to edit"
                              >
                                {mark}
                              </button>
                            )}
                          </td>
                        ))}
                        <td className="border border-gray-300 p-2 text-center font-bold bg-blue-50">
                          {student.total}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <button
                            onClick={() => removeStudent(student.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Statistics */}
          {students.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Summary Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total Students</div>
                  <div className="text-xl font-bold">{students.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Average Score</div>
                  <div className="text-xl font-bold">
                    {(students.reduce((sum, s) => sum + s.total, 0) / students.length).toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Highest Score</div>
                  <div className="text-xl font-bold text-green-600">
                    {Math.max(...students.map(s => s.total))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Lowest Score</div>
                  <div className="text-xl font-bold text-red-600">
                    {Math.min(...students.map(s => s.total))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalMarks;
