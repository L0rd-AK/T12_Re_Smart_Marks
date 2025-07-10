import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast, { Toaster } from "react-hot-toast";
import { type QuestionFormat } from "../../types/types";
import {
  useGetQuestionFormatsQuery,
  useCreateStudentMarksMutation,
  useGetStudentMarksQuery
} from "../../redux/api/marksApi";

const MidtermShortcurt: React.FC = () => {
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

  // API hooks
  const { data: questionFormats = [], isLoading: formatsLoading } = useGetQuestionFormatsQuery();
  const [createStudentMarks] = useCreateStudentMarksMutation();
  const { data: existingMarks = [], refetch: refetchMarks } = useGetStudentMarksQuery(
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

  // Load selected format from localStorage on mount and load existing marks
  useEffect(() => {
    const saved = localStorage.getItem("selectedFormat");
    if (saved) {
      const format = JSON.parse(saved);
      setSelectedFormat(format);
    }
  }, []);

  // Load existing marks when format is selected
  useEffect(() => {
    if (selectedFormat && existingMarks.length > 0) {
      // Convert existing marks to results format
      const convertedResults = existingMarks
        .filter(mark => mark.examType === 'midterm')
        .map(mark => {
          const summary = mark.marks.map((markValue, index) => ({
            q: selectedFormat.questions[index]?.label || `${index + 1}`,
            mark: markValue
          }));
          return {
            id: mark.studentId,
            summary,
            total: mark.total
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
      // Check against both local results and existing marks from database
      const isDuplicateLocal = results.some((r) => r.id === studentId.trim());
      const isDuplicateDb = existingMarks.some((mark) =>
        mark.studentId === studentId.trim() && mark.examType === 'midterm'
      );

      if (isDuplicateLocal || isDuplicateDb) {
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
        if (!selectedFormat) {
          toast.error("No format selected");
          return;
        }

        try {
          // Convert entry list to marks array matching the format
          const marks = selectedFormat.questions.map(question => {
            const entry = entryList.find(e => e.q === question.label);
            return entry ? entry.mark : 0;
          });

          const total = marks.reduce((sum, mark) => sum + mark, 0);

          // Save to database
          await createStudentMarks({
            formatId: selectedFormat.id,
            name: studentId.trim(),
            studentId: studentId.trim(),
            marks,
            examType: 'midterm'
          }).unwrap();

          // Update local results
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
          toast.success("Student saved to database!");

          // Refetch to get updated data
          refetchMarks();
        } catch (error) {
          const errorMessage = error && typeof error === 'object' && 'data' in error
            ? ((error.data as { message?: string })?.message || "Failed to save student marks")
            : "Failed to save student marks";
          toast.error(errorMessage);
        }
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
      setEntryList((prev) => [...prev, { q: qLabel, mark: num }]);
      setMarkInput("");
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    // Combine local results with existing marks from database
    const allResults = [...results];

    // Add existing marks that aren't already in local results
    existingMarks
      .filter(mark => mark.examType === 'midterm')
      .forEach(mark => {
        const existsInLocal = results.some(r => r.id === mark.studentId);
        if (!existsInLocal && selectedFormat) {
          const summary = mark.marks.map((markValue, index) => ({
            q: selectedFormat.questions[index]?.label || `${index + 1}`,
            mark: markValue
          }));
          allResults.push({
            id: mark.studentId,
            summary,
            total: mark.total
          });
        }
      });

    if (allResults.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Get all unique question labels from all students
    const allQuestions = Array.from(
      new Set(allResults.flatMap((s) => s.summary.map((e) => e.q)))
    );
    // Prepare data rows
    const excelData = allResults.map((student) => {
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
    XLSX.utils.book_append_sheet(wb, ws, "Midterm Shortcut");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      data,
      `midterm-shortcut-${new Date().toISOString().split("T")[0]}.xlsx`
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <Toaster position="bottom-right" />
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4 flex justify-end">
            <a
              href="/midterm-marks"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go to Standard Entry
            </a>
          </div>
          {/* Live Summary Table (moved above input fields) */}
          {Object.keys(questionSums).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">
                Live Entry Summary
              </h3>
              <div className="mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Live Entry Summary
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-center">
                          Serial No
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Question No
                        </th>
                        <th className="border border-gray-300 p-2 text-center">
                          Sum
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(questionSums).map(
                        ([questionNo, sum], idx) => (
                          <tr key={questionNo}>
                            <td className="border border-gray-300 p-2 text-center">
                              {(idx + 1).toString().padStart(2, "0")}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {questionNo}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {sum}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100">
                        <td
                          className="border border-gray-300 p-2 text-center"
                          colSpan={2}
                        >
                          <strong>Total</strong>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <strong>
                            {Object.values(questionSums).reduce(
                              (acc, val) => acc + val,
                              0
                            )}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Midterm Marks Shortcut Entry
          </h1>

          {/* Format Selection */}
          {!selectedFormat && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Select Question Format
              </h3>
              {formatsLoading ? (
                <div className="text-center">Loading formats...</div>
              ) : questionFormats.length === 0 ? (
                <div className="text-center text-gray-600">
                  No question formats found. Please create a format first in the standard entry page.
                </div>
              ) : (
                <div className="space-y-2">
                  {questionFormats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => {
                        setSelectedFormat(format);
                        localStorage.setItem("selectedFormat", JSON.stringify(format));
                      }}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="font-medium">{format.name}</div>
                      <div className="text-sm text-gray-600">
                        {format.questions.length} questions, {' '}
                        {format.questions.reduce((sum, q) => sum + q.maxMark, 0)} total marks
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedFormat && (
            <>
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-800">
                  Selected Format: {selectedFormat.name}
                </div>
                <button
                  onClick={() => {
                    setSelectedFormat(null);
                    localStorage.removeItem("selectedFormat");
                    setResults([]);
                    setStep("student");
                  }}
                  className="mt-2 px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  Change Format
                </button>
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
                      <span className="font-bold">{questionInput}</span>
                    </div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mark Input
                    </label>
                    <input
                      ref={markInputRef}
                      type="number"
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
            </>
          )}
          {/* Results Table */}
          {(results.length > 0 || existingMarks.some(mark => mark.examType === 'midterm')) && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  Results Table ({results.length + existingMarks.filter(mark => mark.examType === 'midterm' && !results.some(r => r.id === mark.studentId)).length} students)
                </h3>
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
                        ID
                      </th>
                      {(selectedFormat?.questions || []).map((q) => (
                        <th
                          key={q.label}
                          className="border border-gray-300 p-2 text-center"
                        >
                          Q{q.label}
                        </th>
                      ))}
                      <th className="border border-gray-300 p-2 text-center font-bold">
                        Total
                      </th>
                      <th className="border border-gray-300 p-2 text-center">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Local results */}
                    {results.map((student) => {
                      // Calculate total for this student
                      let total = 0;
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2 font-medium">
                            {student.id}
                          </td>
                          {(selectedFormat?.questions || []).map((q) => {
                            const marks = student.summary
                              .filter((e) => e.q === q.label)
                              .map((e) => e.mark);
                            total += marks.reduce((a, b) => a + b, 0);
                            return (
                              <td
                                key={q.label}
                                className="border border-gray-300 p-2 text-center"
                              >
                                {marks.length > 0 ? marks.join(", ") : ""}
                              </td>
                            );
                          })}
                          <td className="border border-gray-300 p-2 text-center font-bold bg-blue-50">
                            {total}
                          </td>
                          <td className="border border-gray-300 p-2 text-center text-sm">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Current Session
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Existing marks from database (not in current session) */}
                    {existingMarks
                      .filter(mark => mark.examType === 'midterm' && !results.some(r => r.id === mark.studentId))
                      .map((mark) => (
                        <tr key={mark.id} className="hover:bg-gray-50 bg-gray-25">
                          <td className="border border-gray-300 p-2 font-medium">
                            {mark.studentId}
                          </td>
                          {(selectedFormat?.questions || []).map((q, index) => (
                            <td
                              key={q.label}
                              className="border border-gray-300 p-2 text-center"
                            >
                              {mark.marks[index] !== undefined ? mark.marks[index] : ''}
                            </td>
                          ))}
                          <td className="border border-gray-300 p-2 text-center font-bold bg-green-50">
                            {mark.total}
                          </td>
                          <td className="border border-gray-300 p-2 text-center text-sm">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              Database
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {/* Summary below table */}
              {(() => {
                // Combine local results with existing marks for statistics
                const allResults = [...results];

                // Add existing marks that aren't already in local results
                existingMarks
                  .filter(mark => mark.examType === 'midterm')
                  .forEach(mark => {
                    const existsInLocal = results.some(r => r.id === mark.studentId);
                    if (!existsInLocal && selectedFormat) {
                      const summary = mark.marks.map((markValue, index) => ({
                        q: selectedFormat.questions[index]?.label || `${index + 1}`,
                        mark: markValue
                      }));
                      allResults.push({
                        id: mark.studentId,
                        summary,
                        total: mark.total
                      });
                    }
                  });

                const totals = allResults.map((student) => {
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
                const highestStudents = allResults
                  .filter((_, i) => totals[i] === highest)
                  .map((s) => s.id);
                const lowestStudents = allResults
                  .filter((_, i) => totals[i] === lowest)
                  .map((s) => s.id);
                return (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between">
                    <div>
                      <b>Average:</b> {average}
                    </div>
                    <div>
                      <b className="text-green-500">Highest:</b> {highest} (
                      {highestStudents.join(", ")})
                    </div>
                    <div>
                      <b className="text-red-500">Lowest:</b> {lowest} (
                      {lowestStudents.join(", ")})
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

export default MidtermShortcurt;
