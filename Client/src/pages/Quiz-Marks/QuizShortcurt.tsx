import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast, { Toaster } from "react-hot-toast";
import { type QuestionFormat } from "../../types/types";

const QuizShortcut: React.FC = () => {
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
    const [step, setStep] = useState<"student" | "question" | "mark">(
        "student"
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
        if (step === "mark" && markInputRef.current)
            markInputRef.current.focus();
    }, [step]);

    // Load selected format from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("selectedFormat");
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
                const total = entryList.reduce(
                    (sum, entry) => sum + entry.mark,
                    0
                );
                setResults((prev) => [
                    ...prev,
                    {
                        id: studentId.trim(),
                        summary: entryList.map((e) => ({
                            q: e.q,
                            mark: e.mark,
                        })),
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
            const qObj = selectedFormat?.questions.find(
                (q) => q.label === qLabel
            );
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
        XLSX.utils.book_append_sheet(wb, ws, "Quiz Shortcut");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(
            data,
            `quiz-shortcut-${new Date().toISOString().split("T")[0]}.xlsx`
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
                            href="/quiz-marks"
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
                                                            {(idx + 1)
                                                                .toString()
                                                                .padStart(
                                                                    2,
                                                                    "0"
                                                                )}
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
                                                        {Object.values(
                                                            questionSums
                                                        ).reduce(
                                                            (acc, val) =>
                                                                acc + val,
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
                        Quiz Marks Shortcut Entry
                    </h1>
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
                                    onChange={(e) =>
                                        setStudentId(e.target.value)
                                    }
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
                                    onChange={(e) =>
                                        setQuestionInput(e.target.value)
                                    }
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
                                    <span className="font-bold">
                                        {questionInput}
                                    </span>
                                </div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mark Input
                                </label>
                                <input
                                    ref={markInputRef}
                                    type="number"
                                    value={markInput}
                                    onChange={(e) =>
                                        setMarkInput(e.target.value)
                                    }
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
                                <h3 className="text-lg font-semibold">
                                    Results Table
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
                                            {(
                                                selectedFormat?.questions || []
                                            ).map((q) => (
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((student) => {
                                            // Calculate total for this student
                                            let total = 0;
                                            return (
                                                <tr
                                                    key={student.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="border border-gray-300 p-2 font-medium">
                                                        {student.id}
                                                    </td>
                                                    {(
                                                        selectedFormat?.questions ||
                                                        []
                                                    ).map((q) => {
                                                        const marks =
                                                            student.summary
                                                                .filter(
                                                                    (e) =>
                                                                        e.q ===
                                                                        q.label
                                                                )
                                                                .map(
                                                                    (e) =>
                                                                        e.mark
                                                                );
                                                        total += marks.reduce(
                                                            (a, b) => a + b,
                                                            0
                                                        );
                                                        return (
                                                            <td
                                                                key={q.label}
                                                                className="border border-gray-300 p-2 text-center"
                                                            >
                                                                {marks.length >
                                                                0
                                                                    ? marks.join(
                                                                          ", "
                                                                      )
                                                                    : ""}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="border border-gray-300 p-2 text-center font-bold bg-blue-50">
                                                        {total}
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
                                    const questionSumsRow: Record<
                                        string,
                                        number
                                    > = {};
                                    student.summary.forEach((entry) => {
                                        questionSumsRow[entry.q] =
                                            (questionSumsRow[entry.q] || 0) +
                                            entry.mark;
                                    });
                                    return Object.values(
                                        questionSumsRow
                                    ).reduce((a, b) => a + b, 0);
                                });
                                const average = totals.length
                                    ? (
                                          totals.reduce((a, b) => a + b, 0) /
                                          totals.length
                                      ).toFixed(2)
                                    : 0;
                                const highest = Math.max(...totals);
                                const lowest = Math.min(...totals);
                                const highestStudents = results
                                    .filter(
                                        (student, i) => totals[i] === highest
                                    )
                                    .map((s) => s.id);
                                const lowestStudents = results
                                    .filter(
                                        (student, i) => totals[i] === lowest
                                    )
                                    .map((s) => s.id);
                                return (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between">
                                        <div>
                                            <b>Average:</b> {average}
                                        </div>
                                        <div>
                                            <b className="text-green-500">
                                                Highest:
                                            </b>{" "}
                                            {highest} (
                                            {highestStudents.join(", ")})
                                        </div>
                                        <div>
                                            <b className="text-red-500">
                                                Lowest:
                                            </b>{" "}
                                            {lowest} (
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

export default QuizShortcut;
