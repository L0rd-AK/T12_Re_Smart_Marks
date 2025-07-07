import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast, { Toaster } from 'react-hot-toast';
import { type QuestionFormat } from '../../types/types';

const MidtermShortcurt: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<QuestionFormat | null>(null);
  const [studentId, setStudentId] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [markInput, setMarkInput] = useState('');
  const [entryList, setEntryList] = useState<Array<{ q: string; mark: number }>>([]);
  const [results, setResults] = useState<Array<{ id: string; summary: Array<{ q: string; mark: number }>, total: number }>>([]);
  const [step, setStep] = useState<'student' | 'question' | 'mark'>('student');

  // Input refs
  const studentIdRef = useRef<HTMLInputElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);
  const markInputRef = useRef<HTMLInputElement>(null);

  // Focus management
  useEffect(() => {
    if (step === 'student' && studentIdRef.current) studentIdRef.current.focus();
    if (step === 'question' && questionInputRef.current) questionInputRef.current.focus();
    if (step === 'mark' && markInputRef.current) markInputRef.current.focus();
  }, [step]);

  // Load selected format from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedFormat');
    if (saved) {
      setSelectedFormat(JSON.parse(saved));
    }
  }, []);

  // Handle student ID input
  const handleStudentId = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!studentId.trim()) {
        toast.error('Student ID required');
        return;
      }
      if (results.some(r => r.id === studentId.trim())) {
        toast.error('Duplicate Student ID!');
        return;
      }
      setStep('question');
    }
  };

  // Handle question input
  const handleQuestionInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const qLabel = questionInput.trim();
      if (qLabel === '0') {
        // Finish student entry
        if (entryList.length === 0) {
          toast.error('No marks entered');
          return;
        }
        const total = entryList.reduce((sum, entry) => sum + entry.mark, 0);
        setResults(prev => [
          ...prev,
          { id: studentId.trim(), summary: entryList.map(e => ({ q: e.q, mark: e.mark })), total }
        ]);
        setStudentId('');
        setEntryList([]);
        setQuestionInput('');
        setMarkInput('');
        setStep('student');
        toast.success('Student saved!');
        return;
      }
      // Fix: allow numeric input if format label is a string number
      const valid = selectedFormat?.questions.some(q => String(q.label) === qLabel);
      if (!valid) {
        toast.error('Invalid question label');
        return;
      }
      setStep('mark');
    }
  };

  // Handle mark input
  const handleMarkInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const markVal = markInput.trim();
      if (markVal === '-1') {
        setStep('question');
        setQuestionInput('');
        setMarkInput('');
        return;
      }
      const num = parseFloat(markVal);
      const qLabel = questionInput.trim();
      const qObj = selectedFormat?.questions.find(q => q.label === qLabel);
      if (!qObj) {
        toast.error('Invalid question label');
        return;
      }
      if (isNaN(num) || num < 0 || num > qObj.maxMark) {
        toast.error(`Mark should be between 0 and ${qObj.maxMark}`);
        return;
      }
      setEntryList(prev => [...prev, { q: qLabel, mark: num }]);
      setMarkInput('');
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (results.length === 0) {
      toast.error('No data to export');
      return;
    }
    const excelData = results.map(student => {
      const row: Record<string, string | number> = {
        'Student ID': student.id,
        'Total': student.total
      };
      student.summary.forEach((entry) => {
        row[`Q${entry.q}`] = entry.mark;
      });
      return row;
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Midterm Shortcut');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `midterm-shortcut-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel file exported successfully!');
  };

  // Calculate summary only when entryList changes
  const questionSums = React.useMemo(() => {
    const sums: Record<string, number> = {};
    entryList.forEach(entry => {
      sums[entry.q] = (sums[entry.q] || 0) + entry.mark;
    });
    return sums;
  }, [entryList]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <Toaster position="bottom-right" />
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4 flex justify-end">
            <a href="/midterm-marks" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Go to Standard Entry</a>
          </div>
          {/* Live Summary Table (moved above input fields) */}
          {Object.keys(questionSums).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Live Entry Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-center">Serial No</th>
                      <th className="border border-gray-300 p-2 text-center">Question No</th>
                      <th className="border border-gray-300 p-2 text-center">Sum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(questionSums).map(([q, sum], i) => (
                      <tr key={q}>
                        <td className="border border-gray-300 p-2 text-center">{String(i + 1).padStart(2, '0')}</td>
                        <td className="border border-gray-300 p-2 text-center">{q}</td>
                        <td className="border border-gray-300 p-2 text-center">{sum}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Midterm Marks Shortcut Entry</h1>
          <div className="space-y-4">
            {step === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                <input
                  ref={studentIdRef}
                  type="text"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  onKeyDown={handleStudentId}
                  placeholder="Enter student ID"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  title="Enter student ID and press Enter"
                />
              </div>
            )}
            {step === 'question' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Number</label>
                <input
                  ref={questionInputRef}
                  type="text"
                  value={questionInput}
                  onChange={e => setQuestionInput(e.target.value)}
                  onKeyDown={handleQuestionInput}
                  placeholder="e.g. 1, 2a, etc. (0 to finish)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  title="Type question label, 0 to finish, Enter to proceed"
                />
              </div>
            )}
            {step === 'mark' && (
              <div>
                <div className="mb-2 text-blue-800 font-semibold">Inputting for Question: <span className="font-bold">{questionInput}</span></div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mark Input</label>
                <input
                  ref={markInputRef}
                  type="number"
                  value={markInput}
                  onChange={e => setMarkInput(e.target.value)}
                  onKeyDown={handleMarkInput}
                  placeholder="Enter mark (press -1 to finish question)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  title="Type mark, Enter to add, -1 to finish question"
                />
              </div>
            )}
          </div>
          {/* Results Table */}
          {results.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Results Table</h3>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  title="Export to Excel"
                >
                  Export to Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Student ID</th>
                      <th className="border border-gray-300 p-2 text-center">Serial No</th>
                      <th className="border border-gray-300 p-2 text-center">Question No</th>
                      <th className="border border-gray-300 p-2 text-center">Mark</th>
                      <th className="border border-gray-300 p-2 text-center font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(student => (
                      student.summary.map((entry, j) => (
                        <tr key={student.id + '-' + j} className="hover:bg-gray-50">
                          {j === 0 && (
                            <td className="border border-gray-300 p-2 font-medium" rowSpan={student.summary.length}>{student.id}</td>
                          )}
                          <td className="border border-gray-300 p-2 text-center">{String(j + 1).padStart(2, '0')}</td>
                          <td className="border border-gray-300 p-2 text-center">{entry.q}</td>
                          <td className="border border-gray-300 p-2 text-center">{entry.mark}</td>
                          {j === 0 && (
                            <td className="border border-gray-300 p-2 text-center font-bold bg-blue-50" rowSpan={student.summary.length}>{student.total}</td>
                          )}
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MidtermShortcurt; 