import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface QuestionTemplate {
  id: string;
  name: string;
  type: 'quiz' | 'midterm' | 'final';
  year: string;
  courseName: string;
  courseCode: string;
  description: string;
  questions: Question[];
  totalMarks: number;
  duration: number; // in minutes
  instructions: string;
  isStandard: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

interface Question {
  id: string;
  questionNo: string;
  marks: number;
  courseOutcomeStatements?: string;
  type?: 'mcq' | 'short-answer' | 'essay' | 'numerical' | 'true-false';
  question?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  bloomsLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  options?: string[]; // for MCQ
  correctAnswer?: string;
  rubric?: string;
}

const QuestionPaperTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([
    {
      id: '1',
      name: '2025_Summer_61_T2',
      type: 'midterm',
      year: '2025',
      courseName: 'Computer Science',
      courseCode: 'CS101',
      description: 'Standard midterm template for CS courses',
      questions: [
        {
          id: 'q1',
          questionNo: '1',
          marks: 5,
          courseOutcomeStatements: 'CO1',
        },
        {
          id: 'q2',
          questionNo: '2',
          marks: 5,
          courseOutcomeStatements: 'CO2',
        },
        {
          id: 'q3',
          questionNo: '3',
          marks: 5,
          courseOutcomeStatements: 'CO3',
        },
        {
          id: 'q4',
          questionNo: '4',
          marks: 5,
          courseOutcomeStatements: 'CO4',
        }
      ],
      totalMarks: 20,
      duration: 90,
      instructions: 'Answer all questions. Show your work clearly.',
      isStandard: true,
      createdAt: '2025-07-20',
      usageCount: 5,
      lastUsed: '2025-07-22'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'midterm' as QuestionTemplate['type'],
    year: '2025',
    courseName: '',
    courseCode: '',
    description: '',
    duration: 90,
    instructions: '',
    isStandard: false,
  });

  const [templateQuestions, setTemplateQuestions] = useState<Array<{
    id: string;
    questionNo: string;
    marks: number;
    courseOutcomeStatements?: string;
  }>>([]);

  // Available options for dropdowns
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());
  
  const courses = [
    { name: 'Computer Science', code: 'CS101' },
    { name: 'Data Structures', code: 'CS102' },
    { name: 'Algorithms', code: 'CS201' },
    { name: 'Database Systems', code: 'CS301' },
    { name: 'Software Engineering', code: 'CS401' },
  ];

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: 'mcq',
    question: '',
    marks: 1,
    difficulty: 'medium',
    bloomsLevel: 'understand',
    options: ['', '', '', ''],
    correctAnswer: '',
    rubric: '',
  });

  const handleCreateTemplate = () => {
    console.log('Creating template with data:', newTemplate);
    if (!newTemplate.name.trim() || !newTemplate.description.trim() || !newTemplate.courseName.trim() || !newTemplate.courseCode.trim()) {
      console.error('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }

    if (templateQuestions.length === 0) {
      console.error('Please add at least one question');
      toast.error('Please add at least one question');
      return;
    }

    const questions = templateQuestions.map(q => ({
      id: q.id,
      questionNo: q.questionNo,
      marks: q.marks,
      courseOutcomeStatements: q.courseOutcomeStatements,
    }));

    const template: QuestionTemplate = {
      id: Date.now().toString(),
      ...newTemplate,
      questions,
      totalMarks: templateQuestions.reduce((sum, q) => sum + q.marks, 0),
      createdAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({
      name: '',
      type: 'midterm',
      year: '2025',
      courseName: '',
      courseCode: '',
      description: '',
      duration: 90,
      instructions: '',
      isStandard: false,
    });
    setTemplateQuestions([]);
    setShowCreateModal(false);
    toast.success('Template created successfully');

    // Log the structured JSON format for backend
    console.log('Template Data for Backend:', {
      template,
      questions,
      metadata: {
        totalQuestions: questions.length,
        totalMarks: template.totalMarks,
        createdAt: template.createdAt
      }
    });
  };

  const handleAddQuestionToTemplate = () => {
    const newQuestionItem = {
      id: Date.now().toString(),
      questionNo: '',
      marks: 1,
      courseOutcomeStatements: '',
    };
    setTemplateQuestions(prev => [...prev, newQuestionItem]);
  };

  const handleDeleteQuestion = (index: number) => {
    setTemplateQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: string, value: string | number) => {
    setTemplateQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const handleAddQuestion = () => {
    if (!editingTemplate || !newQuestion.question?.trim()) {
      toast.error('Please fill in the question');
      return;
    }

    const question: Question = {
      id: Date.now().toString(),
      questionNo: `Q${Date.now()}`, // Add default questionNo
      marks: newQuestion.marks || 1,
      type: newQuestion.type || 'mcq',
      question: newQuestion.question || '',
      difficulty: newQuestion.difficulty || 'medium',
      bloomsLevel: newQuestion.bloomsLevel || 'understand',
      options: newQuestion.type === 'mcq' ? newQuestion.options : undefined,
      correctAnswer: newQuestion.correctAnswer,
      rubric: newQuestion.rubric,
    };

    setTemplates(prev => prev.map(template => 
      template.id === editingTemplate 
        ? { 
            ...template, 
            questions: [...template.questions, question],
            totalMarks: template.totalMarks + question.marks
          }
        : template
    ));

    setNewQuestion({
      type: 'mcq',
      question: '',
      marks: 1,
      difficulty: 'medium',
      bloomsLevel: 'understand',
      options: ['', '', '', ''],
      correctAnswer: '',
      rubric: '',
    });
    setShowQuestionModal(false);
    toast.success('Question added successfully');
  };

  const filteredTemplates = templates.filter(template => 
    filterType === 'all' || template.type === filterType
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'midterm': return 'bg-blue-100 text-blue-800';
      case 'final': return 'bg-purple-100 text-purple-800';
      case 'quiz': return 'bg-green-100 text-green-800';
      case 'assignment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Question Paper Templates</h2>
          <p className="text-gray-600 mt-1">Define and enforce standardized question paper formats</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Create Template
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{templates.length}</div>
          <div className="text-blue-100">Total Templates</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{templates.filter(t => t.isStandard).length}</div>
          <div className="text-green-100">Standard Templates</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</div>
          <div className="text-purple-100">Total Usage</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{templates.reduce((sum, t) => sum + t.questions.length, 0)}</div>
          <div className="text-orange-100">Total Questions</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border text-black border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Filter templates by type"
        >
          <option value="all">All Types</option>
          <option value="midterm">Midterm</option>
          <option value="final">Final</option>
          <option value="quiz">Quiz</option>
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              </div>
              {template.isStandard && (
                <span className="bg-gold-100 text-gold-800 text-xs px-2 py-1 rounded-full font-medium">
                  ⭐ Standard
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                  {template.type}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Questions:</span>
                <span className="font-medium">{template.questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Marks:</span>
                <span className="font-medium">{template.totalMarks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{template.duration} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Usage Count:</span>
                <span className="font-medium">{template.usageCount}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowPreviewModal(true);
                }}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                Preview
              </button>
              <button
                onClick={() => {
                  setEditingTemplate(template.id);
                  setShowQuestionModal(true);
                }}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
              >
                Add Question
              </button>
              <button className="bg-gray-100 text-gray-600 px-3 py-2 rounded text-sm hover:bg-gray-200">
                Copy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto text-black">
            <h3 className="text-lg font-semibold mb-4">Create New Question Paper Template</h3>
            
            <div className="space-y-6">
              {/* Template Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2025_Summer_61_T2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <select
                    value={newTemplate.year}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select year"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <select
                    value={newTemplate.courseName}
                    onChange={(e) => {
                      const selectedCourse = courses.find(c => c.name === e.target.value);
                      setNewTemplate(prev => ({ 
                        ...prev, 
                        courseName: e.target.value,
                        courseCode: selectedCourse?.code || ''
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select course"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.code} value={course.name}>{course.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Code *
                  </label>
                  <select
                    value={newTemplate.courseCode}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, courseCode: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select course code"
                  >
                    <option value="">Select Code</option>
                    {courses.map(course => (
                      <option key={course.code} value={course.code}>{course.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type *
                  </label>
                  <select
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value as QuestionTemplate['type'] }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Template type"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    placeholder='Enter duration in minutes'
                    type="number"
                    value={newTemplate.duration}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, duration: parseInt(e.target.value) || 90 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter template description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={newTemplate.instructions}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, instructions: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Enter instructions for students"
                />
              </div>

              {/* Questions Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Questions</h4>
                  <button
                    onClick={handleAddQuestionToTemplate}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Add Question +
                  </button>
                </div>

                {templateQuestions.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Question No.</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Marks</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Course Outcome</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {templateQuestions.map((question, index) => (
                          <tr key={question.id}>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={question.questionNo}
                                onChange={(e) => handleUpdateQuestion(index, 'questionNo', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g., 1a, 2b"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={question.marks}
                                onChange={(e) => handleUpdateQuestion(index, 'marks', parseFloat(e.target.value) || 0)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                step="0.5"
                                placeholder="2.5"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={question.courseOutcomeStatements || ''}
                                onChange={(e) => handleUpdateQuestion(index, 'courseOutcomeStatements', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g., CO1"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDeleteQuestion(index)}
                                className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                                title="Delete question"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {templateQuestions.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Total Questions:</strong> {templateQuestions.length} | 
                      <strong> Total Marks:</strong> {templateQuestions.reduce((sum, q) => sum + q.marks, 0)}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTemplate.isStandard}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, isStandard: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Mark as standard template</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setTemplateQuestions([]);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto text-black">
            <h3 className="text-lg font-semibold mb-4">Add Question</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type
                  </label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as Question['type'] }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Question type"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="essay">Essay</option>
                    <option value="numerical">Numerical</option>
                    <option value="true-false">True/False</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks
                  </label>
                  <input
                    placeholder='Enter marks for the question'
                    type="number"
                    value={newQuestion.marks}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, marks: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <textarea
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter the question"
                />
              </div>

              {newQuestion.type === 'mcq' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {newQuestion.options?.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(newQuestion.options || [])];
                          newOptions[index] = e.target.value;
                          setNewQuestion(prev => ({ ...prev, options: newOptions }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer
                    </label>
                    <select
                      value={newQuestion.correctAnswer}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Correct answer"
                    >
                      <option value="">Select correct answer</option>
                      {newQuestion.options?.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, difficulty: e.target.value as Question['difficulty'] }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Question difficulty"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bloom&apos;s Level
                  </label>
                  <select
                    value={newQuestion.bloomsLevel}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, bloomsLevel: e.target.value as Question['bloomsLevel'] }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Bloom's taxonomy level"
                  >
                    <option value="remember">Remember</option>
                    <option value="understand">Understand</option>
                    <option value="apply">Apply</option>
                    <option value="analyze">Analyze</option>
                    <option value="evaluate">Evaluate</option>
                    <option value="create">Create</option>
                  </select>
                </div>
              </div>

              {newQuestion.type !== 'mcq' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rubric/Expected Answer
                  </label>
                  <textarea
                    value={newQuestion.rubric}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, rubric: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Enter marking rubric or expected answer"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto text-black">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Preview: {selectedTemplate.name}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Type:</span> {selectedTemplate.type}</div>
                  <div><span className="font-medium">Duration:</span> {selectedTemplate.duration} minutes</div>
                  <div><span className="font-medium">Total Marks:</span> {selectedTemplate.totalMarks}</div>
                  <div><span className="font-medium">Questions:</span> {selectedTemplate.questions.length}</div>
                </div>
                {selectedTemplate.instructions && (
                  <div className="mt-4">
                    <span className="font-medium">Instructions:</span>
                    <p className="text-gray-600 mt-1">{selectedTemplate.instructions}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-4">Questions:</h4>
                <div className="space-y-4">
                  {selectedTemplate.questions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{question.questionNo}</span>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty || 'medium')}`}>
                            {question.difficulty || 'medium'}
                          </span>
                          <span className="text-sm text-gray-500">[{question.marks} marks]</span>
                        </div>
                      </div>
                      
                      {question.options && (
                        <div className="mt-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="text-sm text-gray-600">
                              {String.fromCharCode(97 + optIndex)}. {option}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.rubric && (
                        <div className="mt-2 text-sm text-blue-600">
                          <span className="font-medium">Rubric:</span> {question.rubric}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPaperTemplates;
