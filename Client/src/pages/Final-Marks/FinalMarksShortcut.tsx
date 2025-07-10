import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { QuestionFormat } from "../../types/types";
import {
  useCreateStudentMarksMutation,
  useGetStudentMarksQuery
} from "../../redux/api/marksApi";

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
      savedToDb?: boolean;
    }>
  >([]);
  const [step, setStep] = useState<"student" | "question" | "mark">("student");

  // API hooks
  const [createStudentMarks, { isLoading: creating }] = useCreateStudentMarksMutation();
  const { data: existingMarks, refetch: refetchMarks } = useGetStudentMarksQuery(
    selectedFormat?.id || '',
    { skip: !selectedFormat?.id }
  );

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

  // Load existing marks from API when format is selected
  useEffect(() => {
    if (selectedFormat && existingMarks) {
      const finalMarks = existingMarks.filter(mark => mark.examType === 'final');
      const convertedResults = finalMarks.map(mark => {
        // Convert API marks back to summary format
        const summary = selectedFormat.questions.map((q, index) => ({
          q: String(q.label.split("Q")[1] || q.label),
          mark: mark.marks[index] || 0
        })).filter(entry => entry.mark > 0);

        return {
          id: mark.studentId,
          summary,
          total: mark.total,
          savedToDb: true
        };
      });

      setResults(convertedResults);
    }
  }, [selectedFormat, existingMarks]);

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
  const handleQuestionInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const qLabel = questionInput.trim();
      if (qLabel === "0") {
        // Finish student entry
        if (entryList.length === 0) {
          toast.error("No marks entered");
          return;
        }

        // Save to API
        if (selectedFormat && !creating) {
          try {
            // Convert entryList to marks array matching format questions order
            const marks = selectedFormat.questions.map(q => {
              const entries = entryList.filter(entry => entry.q === String(q.label.split("Q")[1] || q.label));
              return entries.reduce((sum, entry) => sum + entry.mark, 0);
            });

            await createStudentMarks({
              formatId: selectedFormat.id,
              studentId: studentId.trim(),
              marks,
              examType: 'final' as const,
            }).unwrap();

            toast.success("Student marks saved to database!");

            // Refetch existing marks to update the view
            refetchMarks();
          } catch (error) {
            console.error('Error saving to API:', error);
            toast.error("Failed to save to database, but keeping local copy");
          }
        }

        const total = entryList.reduce((sum, entry) => sum + entry.mark, 0);
        setResults((prev) => [
          ...prev,
          {
            id: studentId.trim(),
            summary: entryList.map((e) => ({ q: e.q, mark: e.mark })),
            total,
            savedToDb: selectedFormat ? true : false,
          },
        ]);
        setStudentId("");
        setEntryList([]);
        setQuestionInput("");
        setMarkInput("");
        setStep("student");
        return;
      }
      // Fix: allow numeric input if format label is a string number
      const valid = selectedFormat?.questions.some(
        (q) => String(q.label.split("Q")[1]) === qLabel
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
      const qObj = selectedFormat?.questions.find((q) => q.label.split("Q")[1] === qLabel);
      if (!qObj) {
        toast.error("Invalid question label");
        return;
      }
      if (isNaN(num) || num < 0 || num > qObj.maxMark) {
        toast.error(`Mark should be between 0 and ${qObj.maxMark}`);
        return;
      }
      // Use just the numeric part of the question label for consistency
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
        row[`${q}`] = marks.length > 0 ? marks.join(", ") : "";
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

  // Clear all data
  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This will only clear the local view, not the database.")) {
      setResults([]);
      setStudentId("");
      setEntryList([]);
      setQuestionInput("");
      setMarkInput("");
      setStep("student");
      toast.success("Local data cleared!");
    }
  };

  // Sync unsaved entries to database
  const syncToDatabase = async () => {
    if (!selectedFormat) {
      toast.error("No format selected");
      return;
    }

    const unsavedEntries = results.filter(result => !result.savedToDb);
    if (unsavedEntries.length === 0) {
      toast.success("All entries are already saved to database");
      return;
    }

    try {
      for (const entry of unsavedEntries) {
        // Convert summary back to marks array
        const marks = selectedFormat.questions.map(q => {
          const entries = entry.summary.filter(s => s.q === String(q.label.split("Q")[1] || q.label));
          return entries.reduce((sum, e) => sum + e.mark, 0);
        });

        await createStudentMarks({
          formatId: selectedFormat.id,
          studentId: entry.id,
          marks,
          examType: 'final' as const,
        }).unwrap();
      }

      // Update all entries as saved
      setResults(prev => prev.map(result => ({ ...result, savedToDb: true })));
      refetchMarks();
      toast.success(`${unsavedEntries.length} entries synced to database!`);
    } catch (error) {
      console.error('Error syncing to database:', error);
      toast.error("Failed to sync some entries to database");
    }
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
          <div className="mb-4 flex justify-between">
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Clear All Data
            </button>
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
              {selectedFormat.questions.map((question, index) => (
                <div
                  key={index}
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
                  disabled={creating}
                />
                {creating && (
                  <div className="mt-2 text-sm text-blue-600">
                    Saving previous student to database...
                  </div>
                )}
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
                  onChange={(e) => setQuestionInput(`${e.target.value}`)}
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
                <div className="flex gap-2">
                  {selectedFormat && results.some(r => !r.savedToDb) && (
                    <button
                      onClick={syncToDatabase}
                      disabled={creating}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      title="Sync unsaved entries to database"
                    >
                      {creating ? 'Syncing...' : 'Sync to DB'}
                    </button>
                  )}
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    title="Export to Excel"
                  >
                    Export to Excel
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">
                        Student ID
                      </th>
                      <th className="border border-gray-300 p-2 text-center">
                        Status
                      </th>
                      {/* {Array.from(
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
                      ))} */}
                      {selectedFormat?.questions.map((question, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 p-2 text-center"
                        >
                          {question.label}
                          <br />
                          <span className="text-xs text-gray-500">
                            /{question.maxMark}
                          </span>
                        </th>
                      ))}
                      <th className="border border-gray-300 p-2 text-center font-bold">
                        Total
                      </th>
                      <th className="border border-gray-300 p-2 text-center">
                        %
                      </th>
                      <th className="border border-gray-300 p-2 text-center">
                        Actions
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
                          <td className="border border-gray-300 p-2 text-center">
                            {student.savedToDb ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                Saved
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                Local Only
                              </span>
                            )}
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
