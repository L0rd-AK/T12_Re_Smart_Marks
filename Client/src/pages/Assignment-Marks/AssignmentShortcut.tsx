import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCreateQuestionFormatMutation } from '../../redux/api/marksApi';

const AssignmentShortcut: React.FC = () => {
  const navigate = useNavigate();
  const [createQuestionFormat, { isLoading }] = useCreateQuestionFormatMutation();
  const [formatName, setFormatName] = useState('');
  const [questions, setQuestions] = useState<Array<{ label: string; maxMark: number }>>([
    { label: 'Assignment 1', maxMark: 5 },
  ]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { label: '', maxMark: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: 'label' | 'maxMark', value: string | number) => {
    const updatedQuestions = [...questions];
    if (field === 'label') {
      updatedQuestions[index].label = value as string;
    } else {
      updatedQuestions[index].maxMark = value as number;
    }
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formatName.trim()) {
      alert('Please enter a format name');
      return;
    }

    if (questions.some(q => !q.label.trim() || q.maxMark <= 0)) {
      alert('Please fill in all question labels and marks');
      return;
    }

    try {
      const result = await createQuestionFormat({
        name: formatName,
        questions,
      }).unwrap();

      // Navigate to assignment marks page with the created format
      navigate(`/assignment-marks/${result.id}`);
    } catch (error) {
      console.error('Error creating format:', error);
      alert('Failed to create assignment format');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Assignment Format</h1>
        <p className="text-gray-600 mb-6">
          Create a new assignment format to quickly start grading assignments.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Format Name
            </label>
            <input
              type="text"
              value={formatName}
              onChange={(e) => setFormatName(e.target.value)}
              placeholder="e.g., Programming Assignment 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Questions/Criteria
            </label>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={question.label}
                      onChange={(e) => handleQuestionChange(index, 'label', e.target.value)}
                      placeholder="Question/Criteria label"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={question.maxMark}
                      onChange={(e) => handleQuestionChange(index, 'maxMark', parseInt(e.target.value) || 0)}
                      placeholder="Max"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Add Question
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Assignment Format'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/assignment-marks')}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentShortcut;
