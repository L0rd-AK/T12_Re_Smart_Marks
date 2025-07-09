import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { QuestionFormat } from "../../types/types";

const FinalMarksShortcut: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<QuestionFormat | null>(
    null
  );
  const [studentId, setStudentId] = useState("");
  const [questionInput, setQuestionInput] = useState("");
  const [markInput, setMarkInput] = useState("");
  const [entryList, setEntryList] = useState<
    Array<{ q: string; mark: number }>
  >([]);
  const [results, setResults] = useState<
    Array<{
      id: string;
      summary: Array<{ q: string; mark: number }>;
      total: number;
    }>
  >([]);
  const [step, setStep] = useState<"student" | "question" | "mark">("student");

  // Input refs
  const studentIdRef = useRef<HTMLInputElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);
  const markInputRef = useRef<HTMLInputElement>(null);

  // Focus management
  useEffect(() => {
    if (step === "student" && studentIdRef.current)
      studentIdRef.current.focus();
    if (step === "question" && questionInputRef.current)
      questionInputRef.current.focus();
    if (step === "mark" && markInputRef.current) markInputRef.current.focus();
  }, [step]);

  // Load selected format from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("selectedFinalFormat");
    if (saved) {
      setSelectedFormat(JSON.parse(saved));
    }
  }, []);

  // Handle student ID input
  const handleStudentId = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!studentId.trim()) {
        toast.error("Student ID required");
        return;
      }
      if (results.some((r) => r.id === studentId.trim())) {
        toast.error("Duplicate Student ID!");
        return;
      }
      setStep("question");
    }
  };

  // Handle question input
  const handleQuestionInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const qLabel = questionInput.trim();
      if (qLabel === "0") {
        // Finish student entry
        if (entryList.length === 0) {
          toast.error("No marks entered");
          return;
        }
        const total = entryList.reduce((sum, entry) => sum + entry.mark, 0);
        setResults((prev) => [
          ...prev,
          {
            id: studentId.trim(),
            summary: entryList.map((e) => ({ q: e.q, mark: e.mark })),
            total,
          },
        ]);
        setStudentId("");
        setEntryList([]);
        setQuestionInput("");
        setMarkInput("");
        setStep("student");
        toast.success("Student saved!");
        return;
      }
      // Fix: allow numeric input if format label is a string number
      const valid = selectedFormat?.questions.some(
        (q) => String(q.label) === qLabel
      );
      if (!valid) {
        toast.error("Invalid question label");
        return;
      }
      setStep("mark");
    }
  };

  // Handle mark input
  const handleMarkInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const markVal = markInput.trim();
      if (markVal === "-1") {
        setStep("question");
        setQuestionInput("");
        setMarkInput("");
        return;
      }
      const num = parseFloat(markVal);
      const qLabel = questionInput.trim();
      const qObj = selectedFormat?.questions.find((q) => q.label === qLabel);
      if (!qObj) {
        toast.error("Invalid question label");
        return;
      }
      if (isNaN(num) || num < 0 || num > qObj.maxMark) {
        toast.error(`Mark should be between 0 and ${qObj.maxMark}`);
        return;
      }
      setEntryList((prev) => [...prev, { q: qLabel, mark: num }]);
      setMarkInput("");
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (results.length === 0) {
      toast.error("No data to export");
      return;
    }
    // Get all unique question labels from all students
    const allQuestions = Array.from(
      new Set(results.flatMap((s) => s.summary.map((e) => e.q)))
    );
    // Prepare data rows
    const excelData = results.map((student) => {
      const row: Record<string, string | number> = {
        ID: student.id,
      };
      // For each question, join all marks as comma-separated string
      let total = 0;
      allQuestions.forEach((q) => {
        const marks = student.summary
          .filter((e) => e.q === q)
          .map((e) => e.mark);
        row[`Q${q}`] = marks.length > 0 ? marks.join(", ") : "";
        total += marks.reduce((a, b) => a + b, 0);
      });
      row["Total"] = total;
      return row;
    });
    // Write to Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    ws["!cols"] = [
      { wch: 20 },
      ...allQuestions.map(() => ({ wch: 10 })),
      { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Final Shortcut");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      data,
      `final-shortcut-${new Date().toISOString().split("T")[0]}.xlsx`
    );
    toast.success("Excel file exported successfully!");
  };

  // Calculate summary only when entryList changes
  const questionSums = React.useMemo(() => {
    const sums: Record<string, number> = {};
    entryList.forEach((entry) => {
      sums[entry.q] = (sums[entry.q] || 0) + entry.mark;
    });
    return sums;
  }, [entryList]);

  if (!selectedFormat) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 text-black">
        <Toaster position="bottom-right" />
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Final Marks Shortcut Entry
            </h1>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No question format selected. Please set up a format first.
              </p>
              <a
                href="/final-marks"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Go to Final Marks Setup
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <Toaster position="bottom-right" />
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4 flex justify-end">
            <a
              href="/final-marks"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go to Standard Entry
            </a>
          </div>

          {/* Current Format Display */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              Current Format: {selectedFormat.name}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {selectedFormat.questions.map((question) => (
                <div
                  key={question.id}
                  className="text-center p-2 bg-white rounded border"
                >
                  <div className="font-medium">{question.label}</div>
                  <div className="text-sm text-gray-600">
                    Max: {question.maxMark}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Summary Table (moved above input fields) */}
          {Object.keys(questionSums).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                Live Entry Summary for Student: {studentId}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(questionSums).map((q) => (
                        <th
                          key={q}
                          className="border border-gray-300 p-2 text-center"
                        >
                          Q{q}
                        </th>
                      ))}
                      <th className="border border-gray-300 p-2 text-center font-bold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {Object.values(questionSums).map((sum, index) => (
                        <td
                          key={index}
                          className="border border-gray-300 p-2 text-center"
                        >
                          {sum}
                        </td>
                      ))}
                      <td className="border border-gray-300 p-2 text-center font-bold bg-blue-50">
                        {Object.values(questionSums).reduce((a, b) => a + b, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Final Marks Shortcut Entry
          </h1>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Instructions:
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Enter Student ID and press Enter</li>
              <li>
                • Enter question number (e.g., 1, 2a, etc.) and press Enter
              </li>
              <li>
                • Enter mark for that question and press Enter (can enter
                multiple marks for same question)
              </li>
              <li>• Enter 0 as question number to finish current student</li>
              <li>• Enter -1 as mark to go back to question input</li>
            </ul>
          </div>

          <div className="space-y-4">
            {step === "student" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  ref={studentIdRef}
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyDown={handleStudentId}
                  placeholder="Enter student ID"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  title="Enter student ID and press Enter"
                />
              </div>
            )}
            {step === "question" && (
              <div>
                <div className="mb-2 text-blue-800 font-semibold">
                  Current Student:{" "}
                  <span className="font-bold">{studentId}</span>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Number
                </label>
                <input
                  ref={questionInputRef}
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  onKeyDown={handleQuestionInput}
                  placeholder="e.g. 1, 2a, etc. (0 to finish)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  title="Type question label, 0 to finish, Enter to proceed"
                />
              </div>
            )}
            {step === "mark" && (
              <div>
                <div className="mb-2 text-blue-800 font-semibold">
                  Inputting for Question:{" "}
                  <span className="font-bold">{questionInput}</span> (Student:{" "}
                  {studentId})
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mark Input
                </label>
                <input
                  ref={markInputRef}
                  type="number"
                  step="0.5"
                  value={markInput}
                  onChange={(e) => setMarkInput(e.target.value)}
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
                      <th className="border border-gray-300 p-2 text-left">
                        Student ID
                      </th>
                      {Array.from(
                        new Set(
                          results.flatMap((s) => s.summary.map((e) => e.q))
                        )
                      ).map((q) => (
                        <th
                          key={q}
                          className="border border-gray-300 p-2 text-center"
                        >
                          Q{q}
                        </th>
                      ))}
                      <th className="border border-gray-300 p-2 text-center font-bold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((student) => {
                      const allQuestions = Array.from(
                        new Set(
                          results.flatMap((s) => s.summary.map((e) => e.q))
                        )
                      );
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-medium">
                            {student.id}
                          </td>
                          {allQuestions.map((q) => {
                            const marks = student.summary
                              .filter((e) => e.q === q)
                              .map((e) => e.mark);
                            return (
                              <td
                                key={q}
                                className="border border-gray-300 p-2 text-center"
                              >
                                {marks.length > 0 ? marks.join(", ") : ""}
                              </td>
                            );
                          })}
                          <td className="border border-gray-300 p-2 text-center font-bold bg-blue-50">
                            {(() => {
                              const questionSumsRow: Record<string, number> =
                                {};
                              student.summary.forEach((entry) => {
                                questionSumsRow[entry.q] =
                                  (questionSumsRow[entry.q] || 0) + entry.mark;
                              });
                              return Object.values(questionSumsRow).reduce(
                                (a, b) => a + b,
                                0
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary below table */}
              {(() => {
                const totals = results.map((student) => {
                  const questionSumsRow: Record<string, number> = {};
                  student.summary.forEach((entry) => {
                    questionSumsRow[entry.q] =
                      (questionSumsRow[entry.q] || 0) + entry.mark;
                  });
                  return Object.values(questionSumsRow).reduce(
                    (a, b) => a + b,
                    0
                  );
                });
                const average = totals.length
                  ? (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(
                      2
                    )
                  : 0;
                const highest = totals.length ? Math.max(...totals) : 0;
                const lowest = totals.length ? Math.min(...totals) : 0;
                const highestStudents = results
                  .filter((_, i) => totals[i] === highest)
                  .map((s) => s.id);
                const lowestStudents = results
                  .filter((_, i) => totals[i] === lowest)
                  .map((s) => s.id);

                return (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Summary Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">
                          Total Students
                        </div>
                        <div className="text-xl font-bold">
                          {results.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Average Score
                        </div>
                        <div className="text-xl font-bold">{average}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Highest Score
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {highest} ({highestStudents.join(", ")})
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Lowest Score
                        </div>
                        <div className="text-xl font-bold text-red-600">
                          {lowest} ({lowestStudents.join(", ")})
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinalMarksShortcut;
