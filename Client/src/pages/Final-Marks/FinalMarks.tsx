import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast, { Toaster } from "react-hot-toast";
import {
    type QuestionFormat,
    type Question,
    type StudentMarks,
} from "../../types/types";
import {
    useGetQuestionFormatsQuery,
    useCreateQuestionFormatMutation,
    useCreateStudentMarksMutation,
    useGetStudentMarksQuery,
    useUpdateStudentMarksMutation,
    useDeleteStudentMarksMutation
} from "../../redux/api/marksApi";

const FinalMarks: React.FC = () => {
    const [selectedFormat, setSelectedFormat] = useState<QuestionFormat | null>(
        null
    );
    const [students, setStudents] = useState<StudentMarks[]>([]);
    // const [currentStudentName, setCurrentStudentName] = useState("");
    const [currentStudentId, setCurrentStudentId] = useState("");
    const [currentMarksInput, setCurrentMarksInput] = useState("");
    const [isSetupMode, setIsSetupMode] = useState(true);
    const [newFormatName, setNewFormatName] = useState("");
    const [newQuestions, setNewQuestions] = useState<Question[]>([]);
    const [editingCell, setEditingCell] = useState<{
        studentId: string;
        markIndex: number;
    } | null>(null);

    // API hooks
    const { data: questionFormats = [], isLoading: formatsLoading } = useGetQuestionFormatsQuery();
    const [createQuestionFormat] = useCreateQuestionFormatMutation();
    const [createStudentMarks] = useCreateStudentMarksMutation();
    const [updateStudentMarks] = useUpdateStudentMarksMutation();
    const [deleteStudentMarks] = useDeleteStudentMarksMutation();
    const { data: existingMarks = [], refetch: refetchMarks } = useGetStudentMarksQuery(
        selectedFormat?.id || '',
        { skip: !selectedFormat?.id }
    );

    // Load selected format from localStorage on component mount
    useEffect(() => {
        const savedFormat = localStorage.getItem("selectedFinalFormat");
        if (savedFormat) {
            const format = JSON.parse(savedFormat);
            setSelectedFormat(format);
        }
    }, []);

    // Load existing marks when format is selected
    useEffect(() => {
        if (selectedFormat && existingMarks.length > 0) {
            const finalMarks = existingMarks.filter(mark => mark.examType === 'final');
            setStudents(finalMarks);
        }
    }, [selectedFormat, existingMarks]);

    const createSimpleFormat = async () => {
        try {
            const format = await createQuestionFormat({
                name: "Simple Format - Final (8 questions, 10 marks each)",
                questions: [
                    { label: "Q1", maxMark: 10 },
                    { label: "Q2", maxMark: 10 },
                    { label: "Q3", maxMark: 10 },
                    { label: "Q4", maxMark: 10 },
                    { label: "Q5", maxMark: 10 },
                    { label: "Q6", maxMark: 10 },
                    { label: "Q7", maxMark: 10 },
                    { label: "Q8", maxMark: 10 },
                ],
            }).unwrap();

            setSelectedFormat(format);
            localStorage.setItem("selectedFinalFormat", JSON.stringify(format));
            setIsSetupMode(false);
            toast.success("Simple format created successfully!");
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? ((error.data as { message?: string })?.message || "Failed to create format")
                : "Failed to create format";
            toast.error(errorMessage);
        }
    };

    const createSubQuestionFormat = async () => {
        try {
            const format = await createQuestionFormat({
                name: "Sub-question Format - Final",
                questions: [
                    { label: "Q1a", maxMark: 5 },
                    { label: "Q1b", maxMark: 5 },
                    { label: "Q2a", maxMark: 5 },
                    { label: "Q2b", maxMark: 5 },
                    { label: "Q3a", maxMark: 5 },
                    { label: "Q3b", maxMark: 5 },
                    { label: "Q4", maxMark: 10 },
                    { label: "Q5", maxMark: 10 },
                    { label: "Q6", maxMark: 10 },
                    { label: "Q7", maxMark: 10 },
                    { label: "Q8", maxMark: 10 },
                ],
            }).unwrap();

            setSelectedFormat(format);
            localStorage.setItem("selectedFinalFormat", JSON.stringify(format));
            setIsSetupMode(false);
            toast.success("Sub-question format created successfully!");
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? ((error.data as { message?: string })?.message || "Failed to create format")
                : "Failed to create format";
            toast.error(errorMessage);
        }
    };

    const createCustomFormat = async () => {
        if (newQuestions.length === 0) {
            toast.error("Please add at least one question");
            return;
        }

        try {
            const format = await createQuestionFormat({
                name: newFormatName || "Custom Format - Final",
                questions: newQuestions,
            }).unwrap();

            setSelectedFormat(format);
            localStorage.setItem("selectedFinalFormat", JSON.stringify(format));
            setIsSetupMode(false);
            setNewFormatName("");
            setNewQuestions([]);
            toast.success("Custom format created successfully!");
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? ((error.data as { message?: string })?.message || "Failed to create format")
                : "Failed to create format";
            toast.error(errorMessage);
        }
    };

    const addNewQuestion = () => {
        setNewQuestions((prev) => [
            ...prev,
            { label: `Q${prev.length + 1}`, maxMark: 10 },
        ]);
    };

    const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
        setNewQuestions((prev) =>
            prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
        );
    };

    const removeQuestion = (index: number) => {
        setNewQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const addStudentMarks = async () => {
        if (
            // !currentStudentName.trim()||
            !currentStudentId.trim()
            || !currentMarksInput.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        const marksArray = currentMarksInput
            .split(" ")
            .map((mark) => parseFloat(mark.trim()));

        if (marksArray.length !== selectedFormat?.questions.length) {
            toast.error(
                `Please enter exactly ${selectedFormat?.questions.length} marks separated by commas`
            );
            return;
        }

        // Validate marks against max marks
        const invalidMarks = marksArray.some((mark, index) => {
            const maxMark = selectedFormat?.questions[index]?.maxMark || 0;
            return isNaN(mark) || mark < 0 || mark > maxMark;
        });

        if (invalidMarks) {
            toast.error("One or more marks are invalid or exceed the maximum allowed");
            return;
        }

        // Check for duplicate student ID
        const isDuplicate = students.some(s => s.studentId === currentStudentId.trim());
        if (isDuplicate) {
            toast.error("Student ID already exists!");
            return;
        }

        try {
            console.log('Attempting to save student marks:', {
                formatId: selectedFormat!.id,
                // name: currentStudentName.trim(),
                studentId: currentStudentId.trim(),
                marks: marksArray,
                examType: 'final'
            });

            const savedMarks = await createStudentMarks({
                formatId: selectedFormat!.id,
                // name: currentStudentName.trim(),
                studentId: currentStudentId.trim(),
                marks: marksArray,
                examType: 'final'
            }).unwrap();

            console.log('Successfully saved student marks:', savedMarks);

            setStudents((prev) => [...prev, savedMarks]);
            // setCurrentStudentName("");
            setCurrentStudentId("");
            setCurrentMarksInput("");
            toast.success(`Student ${currentStudentId} added successfully!`);

            // Only refetch if there's an active query
            setTimeout(() => {
                if (selectedFormat?.id) {
                    refetchMarks();
                }
            }, 100);

        } catch (error) {
            console.error('Error saving student marks:', error);

            let errorMessage = "Failed to save student marks";

            if (error && typeof error === 'object') {
                if ('data' in error && error.data && typeof error.data === 'object') {
                    const errorData = error.data as { message?: string; error?: string };
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } else if ('message' in error && typeof error.message === 'string') {
                    errorMessage = error.message;
                } else if ('status' in error) {
                    errorMessage = `Server error (${error.status}): ${errorMessage}`;
                }
            }

            toast.error(errorMessage);
        }
    };

    const removeStudent = async (studentId: string) => {
        try {
            await deleteStudentMarks({
                id: studentId,
                formatId: selectedFormat!.id
            }).unwrap();

            setStudents((prev) => prev.filter((s) => s.id !== studentId));
            toast.success("Student removed successfully!");

            // Only refetch if there's an active query
            setTimeout(() => {
                if (selectedFormat?.id) {
                    refetchMarks();
                }
            }, 100);
        } catch (error) {
            console.error('Error removing student:', error);

            let errorMessage = "Failed to remove student";

            if (error && typeof error === 'object') {
                if ('data' in error && error.data && typeof error.data === 'object') {
                    const errorData = error.data as { message?: string; error?: string };
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } else if ('message' in error && typeof error.message === 'string') {
                    errorMessage = error.message;
                } else if ('status' in error) {
                    errorMessage = `Server error (${error.status}): ${errorMessage}`;
                }
            }

            toast.error(errorMessage);
        }
    };

    const updateStudentMark = async (studentId: string, markIndex: number, newMark: number) => {
        const maxMark = selectedFormat?.questions[markIndex]?.maxMark || 0;
        if (newMark < 0 || newMark > maxMark) {
            toast.error(`Mark should be between 0 and ${maxMark}`);
            return;
        }

        try {
            const student = students.find(s => s.id === studentId);
            if (!student) return;

            const updatedMarks = [...student.marks];
            updatedMarks[markIndex] = newMark;

            await updateStudentMarks({
                id: studentId,
                formatId: selectedFormat!.id,
                // name: student.name,
                studentId: student.studentId,
                marks: updatedMarks,
                examType: 'final'
            }).unwrap();

            setStudents((prev) =>
                prev.map((s) => {
                    if (s.id === studentId) {
                        const newMarks = [...s.marks];
                        newMarks[markIndex] = newMark;
                        return {
                            ...s,
                            marks: newMarks,
                            total: newMarks.reduce((sum, mark) => sum + mark, 0),
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return s;
                })
            );

            setEditingCell(null);
            toast.success("Mark updated successfully!");

            // Only refetch if there's an active query
            setTimeout(() => {
                if (selectedFormat?.id) {
                    refetchMarks();
                }
            }, 100);
        } catch (error) {
            console.error('Error updating student mark:', error);

            let errorMessage = "Failed to update mark";

            if (error && typeof error === 'object') {
                if ('data' in error && error.data && typeof error.data === 'object') {
                    const errorData = error.data as { message?: string; error?: string };
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } else if ('message' in error && typeof error.message === 'string') {
                    errorMessage = error.message;
                } else if ('status' in error) {
                    errorMessage = `Server error (${error.status}): ${errorMessage}`;
                }
            }

            toast.error(errorMessage);
        }
    };

    const exportToExcel = () => {
        if (!selectedFormat || students.length === 0) {
            toast.error("No data to export");
            return;
        }

        const excelData = students.map((student) => {
            const row: Record<string, string | number> = {
                "Student Name": student.name || student.studentId,
                "Student ID": student.studentId,
            };

            selectedFormat.questions.forEach((question, index) => {
                row[`Q${question.label} (/${question.maxMark})`] = student.marks[index] || 0;
            });

            row["Total"] = student.marks.reduce((sum, mark) => sum + mark, 0);
            row["Max Total"] = selectedFormat.questions.reduce((sum, q) => sum + q.maxMark, 0);
            row["Percentage"] = ((row["Total"] / row["Max Total"]) * 100).toFixed(1) + "%";

            return row;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        const colWidths = [
            { wch: 20 }, // Student Name
            { wch: 15 }, // Student ID
        ];
        selectedFormat.questions.forEach(() => colWidths.push({ wch: 12 }));
        colWidths.push({ wch: 10 }, { wch: 10 }, { wch: 12 }); // Total, Max Total, Percentage

        ws["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Final Marks");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(
            data,
            `final-marks-${selectedFormat.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.xlsx`
        );
        toast.success("Excel file exported successfully!");
    };

    const resetToSetup = () => {
        setSelectedFormat(null);
        setStudents([]);
        setIsSetupMode(true);
        localStorage.removeItem("selectedFinalFormat");
        toast.success("Reset to setup mode");
    };

    const loadExistingFormat = (format: QuestionFormat) => {
        setSelectedFormat(format);
        localStorage.setItem("selectedFinalFormat", JSON.stringify(format));
        setIsSetupMode(false);
        toast.success(`Loaded format: ${format.name}`);
    };

    // Get total marks for the format
    const totalMarks = selectedFormat?.questions.reduce((sum, q) => sum + q.maxMark, 0) || 0;

    if (formatsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
                <div className="text-lg">Loading question formats...</div>
            </div>
        );
    }

    if (isSetupMode) {
        // Show all available question formats (they can be used for any exam type)
        const availableFormats = questionFormats;

        return (
            <div className="min-h-screen bg-gray-50 py-8 text-black">
                <Toaster position="bottom-right" />
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">
                            Final Exam Setup
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Choose a question format for your final exam or create a custom one.
                        </p>

                        {/* Quick Format Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold mb-3">
                                    Simple Format (80 marks)
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    8 questions, 10 marks each
                                </p>
                                <button
                                    onClick={createSimpleFormat}
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Use Simple Format
                                </button>
                            </div>

                            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold mb-3">
                                    Sub-question Format (80 marks)
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Mix of main questions and sub-questions
                                </p>
                                <button
                                    onClick={createSubQuestionFormat}
                                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                >
                                    Use Sub-question Format
                                </button>
                            </div>
                        </div>

                        {/* Existing Formats */}
                        {availableFormats.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">
                                    Existing Question Formats
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {availableFormats.map((format) => (
                                        <div
                                            key={format.id}
                                            className="p-4 border border-gray-200 rounded-lg flex justify-between items-center hover:bg-gray-50"
                                        >
                                            <div>
                                                <h4 className="font-medium">{format.name}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {format.questions.length} questions, Total: {format.questions.reduce((sum, q) => sum + q.maxMark, 0)} marks
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => loadExistingFormat(format)}
                                                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                                            >
                                                Use This Format
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Custom Format Creation */}
                        <div className="border-t pt-8">
                            <h3 className="text-lg font-semibold mb-4">
                                Create Custom Format
                            </h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Format Name
                                </label>
                                <input
                                    type="text"
                                    value={newFormatName}
                                    onChange={(e) => setNewFormatName(e.target.value)}
                                    placeholder="Enter format name"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {newQuestions.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-medium mb-2">Questions</h4>
                                    <div className="space-y-2">
                                        {newQuestions.map((question, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                            >
                                                <input
                                                    type="text"
                                                    value={question.label}
                                                    onChange={(e) =>
                                                        updateQuestion(index, "label", e.target.value)
                                                    }
                                                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Question label (e.g., 1, 1a, Q1)"
                                                />
                                                <input
                                                    type="number"
                                                    value={question.maxMark}
                                                    onChange={(e) =>
                                                        updateQuestion(
                                                            index,
                                                            "maxMark",
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                    className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    min="1"
                                                    max="50"
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
                                    <div className="mt-2 text-sm text-gray-600">
                                        Total: {newQuestions.reduce((sum, q) => sum + q.maxMark, 0)} marks
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={addNewQuestion}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                    Add Question
                                </button>
                                {newQuestions.length > 0 && (
                                    <button
                                        onClick={createCustomFormat}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Create Format
                                    </button>
                                )}
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
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="mb-4 flex justify-between items-center">
                        <a
                            href="/final-shortcut"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Go to Shortcut Entry
                        </a>
                        <button
                            onClick={resetToSetup}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Change Format
                        </button>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Final Exam Marks Entry
                            </h1>
                            <p className="text-gray-600">
                                Format: {selectedFormat?.name} ({totalMarks} marks)
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={exportToExcel}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Export to Excel
                            </button>
                        </div>
                    </div>

                    {/* Question Format Display */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Question Format</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {selectedFormat?.questions.map((question, index) => (
                                <div
                                    key={index}
                                    className="text-sm bg-white p-2 rounded border"
                                >
                                    {question.label}: {question.maxMark} marks
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Student Entry Form */}
                    <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">
                            Add Student Marks
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student Name
                                </label>
                                <input
                                    type="text"
                                    value={currentStudentName}
                                    onChange={(e) => setCurrentStudentName(e.target.value)}
                                    placeholder="Enter student name"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div> */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student ID
                                </label>
                                <input
                                    type="text"
                                    value={currentStudentId}
                                    onChange={(e) => setCurrentStudentId(e.target.value)}
                                    placeholder="Enter student ID"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    placeholder={`e.g., ${selectedFormat?.questions
                                        .map((q) => q.maxMark)
                                        .join(" ")}`}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <div className="mt-2 text-sm text-gray-500">
                            Expected format:{" "}
                            {selectedFormat?.questions
                                .map((q) => `${q.label}(${q.maxMark})`)
                                .join(" ")}
                        </div>
                    </div>

                    {/* Students Table */}
                    {students.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">
                                    Student Marks ({students.length} students)
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            {/* <th className="border border-gray-300 p-2 text-left">
                                                Student Name
                                            </th> */}
                                            <th className="border border-gray-300 p-2 text-left">
                                                Student ID
                                            </th>
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
                                            <th className="border border-gray-300 p-2 text-center">
                                                Total
                                                <br />
                                                <span className="text-xs text-gray-500">
                                                    /{totalMarks}
                                                </span>
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
                                        {students.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="hover:bg-gray-50"
                                            >
                                                {/* <td className="border border-gray-300 p-2 font-medium">
                                                    {student.name}
                                                </td> */}
                                                <td className="border border-gray-300 p-2">
                                                    {student.studentId}
                                                </td>
                                                {student.marks.map((mark, markIndex) => (
                                                    <td
                                                        key={markIndex}
                                                        className="border border-gray-300 p-2 text-center"
                                                    >
                                                        {editingCell &&
                                                            editingCell.studentId === student.id &&
                                                            editingCell.markIndex === markIndex ? (
                                                            <input
                                                                type="number"
                                                                defaultValue={mark}
                                                                min="0"
                                                                max={
                                                                    selectedFormat?.questions[markIndex]
                                                                        ?.maxMark || 0
                                                                }
                                                                step="0.5"
                                                                className="w-full p-1 text-center border border-gray-300 rounded"
                                                                autoFocus
                                                                onBlur={(e) => {
                                                                    const newMark =
                                                                        parseFloat(e.target.value) || 0;
                                                                    updateStudentMark(
                                                                        student.id,
                                                                        markIndex,
                                                                        newMark
                                                                    );
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        const newMark =
                                                                            parseFloat(
                                                                                (e.target as HTMLInputElement).value
                                                                            ) || 0;
                                                                        updateStudentMark(
                                                                            student.id,
                                                                            markIndex,
                                                                            newMark
                                                                        );
                                                                    } else if (e.key === "Escape") {
                                                                        setEditingCell(null);
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    setEditingCell({
                                                                        studentId: student.id,
                                                                        markIndex,
                                                                    })
                                                                }
                                                                className="w-full h-full p-1 hover:bg-blue-100 transition-colors rounded"
                                                                title="Click to edit"
                                                            >
                                                                {mark}
                                                            </button>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="border border-gray-300 p-2 text-center font-semibold">
                                                    {student.marks.reduce((sum, mark) => sum + mark, 0)}
                                                </td>
                                                <td className="border border-gray-300 p-2 text-center">
                                                    {(
                                                        (student.marks.reduce((sum, mark) => sum + mark, 0) /
                                                            totalMarks) *
                                                        100
                                                    ).toFixed(1)}
                                                    %
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
                            <h3 className="font-semibold mb-2">
                                Summary Statistics
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Total Students
                                    </div>
                                    <div className="text-xl font-bold">
                                        {students.length}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Average Score
                                    </div>
                                    <div className="text-xl font-bold">
                                        {(
                                            students.reduce(
                                                (sum, s) => sum + s.marks.reduce((mSum, m) => mSum + m, 0),
                                                0
                                            ) / students.length
                                        ).toFixed(1)}
                                        /{totalMarks}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Highest Score
                                    </div>
                                    <div className="text-xl font-bold text-green-600">
                                        {Math.max(
                                            ...students.map((s) =>
                                                s.marks.reduce((sum, mark) => sum + mark, 0)
                                            )
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Lowest Score
                                    </div>
                                    <div className="text-xl font-bold text-red-600">
                                        {Math.min(
                                            ...students.map((s) =>
                                                s.marks.reduce((sum, mark) => sum + mark, 0)
                                            )
                                        )}
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
