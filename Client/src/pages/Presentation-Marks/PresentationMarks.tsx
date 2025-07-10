import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast, { Toaster } from "react-hot-toast";
import { type StudentMarks } from "../../types/types";
import { 
  useCreateStudentMarksMutation,
  useGetStudentMarksByTypeQuery,
  useUpdateStudentMarksMutation,
  useDeleteStudentMarksMutation
} from "../../redux/api/marksApi";

const PresentationMarks: React.FC = () => {
    const [students, setStudents] = useState<StudentMarks[]>([]);
    const [currentStudentId, setCurrentStudentId] = useState("");
    // const [currentStudentName, setCurrentStudentName] = useState("");
    const [currentMark, setCurrentMark] = useState("");
    const [maxMark, setMaxMark] = useState<number>(8); // Default max mark for presentation
    const [editingCell, setEditingCell] = useState<{
        studentId: string;
    } | null>(null);
    const [selectedPresentation, setSelectedPresentation] = useState<string>("Presentation-1");

    // API hooks
    const [createStudentMarks] = useCreateStudentMarksMutation();
    const [updateStudentMarks] = useUpdateStudentMarksMutation();
    const [deleteStudentMarks] = useDeleteStudentMarksMutation();
    const { data: existingMarks = [], refetch: refetchMarks } = useGetStudentMarksByTypeQuery(
        'presentation', // Fetch marks by exam type instead of format ID
        { skip: false }
    );

    // Load existing marks when component mounts
    useEffect(() => {
        if (existingMarks.length > 0) {
            const presentationMarks = existingMarks.filter(mark => mark.examType === 'presentation');
            setStudents(presentationMarks);
        }
    }, [existingMarks]);

    const addStudentMarks = async () => {
        if (!currentStudentId.trim() 
            // || !currentStudentName.trim()
         || !currentMark.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        const mark = parseFloat(currentMark);
        if (isNaN(mark) || mark < 0 || mark > maxMark) {
            toast.error(`Mark should be between 0 and ${maxMark}`);
            return;
        }

        // Check for duplicate student ID
        const isDuplicate = students.some(s => s.studentId === currentStudentId.trim());
        if (isDuplicate) {
            toast.error("Student ID already exists!");
            return;
        }

        try {
            // Save to database - store single mark as array for consistency
            const savedMarks = await createStudentMarks({
                // name: currentStudentName.trim(),
                studentId: currentStudentId.trim(),
                marks: [mark], // Single mark stored as array
                examType: 'presentation',
                maxMark: maxMark
            }).unwrap();

            setStudents((prev) => [...prev, savedMarks]);
            setCurrentStudentId("");
            // setCurrentStudentName("");
            setCurrentMark("");
            toast.success(`Student ${currentStudentId} added successfully!`);
            
            refetchMarks();
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'data' in error 
                ? ((error.data as {message?: string})?.message || "Failed to save student marks")
                : "Failed to save student marks";
            toast.error(errorMessage);
        }
    };

    const removeStudent = async (studentId: string) => {
        try {
            const student = students.find(s => s.id === studentId);
            if (!student) return;

            await deleteStudentMarks({ 
                id: studentId, 
                examType: 'presentation'
            }).unwrap();

            setStudents((prev) => prev.filter((s) => s.id !== studentId));
            toast.success("Student removed successfully!");
            refetchMarks();
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'data' in error 
                ? ((error.data as {message?: string})?.message || "Failed to remove student")
                : "Failed to remove student";
            toast.error(errorMessage);
        }
    };

    const updateStudentMark = async (studentId: string, newMark: number) => {
        if (newMark < 0 || newMark > maxMark) {
            toast.error(`Mark should be between 0 and ${maxMark}`);
            return;
        }

        try {
            const student = students.find(s => s.id === studentId);
            if (!student) return;

            await updateStudentMarks({
                id: studentId,
                // name: student.name,
                studentId: student.studentId,
                marks: [newMark], // Single mark as array
                examType: 'presentation',
                maxMark: maxMark
            }).unwrap();

            setStudents((prev) =>
                prev.map((s) => {
                    if (s.id === studentId) {
                        return { 
                            ...s, 
                            marks: [newMark], 
                            total: newMark,
                            updatedAt: new Date().toISOString() 
                        };
                    }
                    return s;
                })
            );

            setEditingCell(null);
            toast.success("Mark updated successfully!");
            refetchMarks();
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'data' in error 
                ? ((error.data as {message?: string})?.message || "Failed to update mark")
                : "Failed to update mark";
            toast.error(errorMessage);
        }
    };

    const exportToExcel = () => {
        if (students.length === 0) {
            toast.error("No data to export");
            return;
        }

        const excelData = students.map((student) => ({
            "Student ID": student.studentId,
            // "Student Name": student.name,
            "Mark": student.marks[0], // Single mark from array
            "Max Mark": maxMark,
            "Percentage": ((student.marks[0] / maxMark) * 100).toFixed(1) + "%"
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        ws["!cols"] = [
            { wch: 15 }, // Student ID
            { wch: 20 }, // Student Name
            { wch: 10 }, // Mark
            { wch: 10 }, // Max Mark
            { wch: 12 }, // Percentage
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Presentation Marks");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(
            data,
            `presentation-marks-${selectedPresentation.toLowerCase()}-${new Date().toISOString().split("T")[0]}.xlsx`
        );
        toast.success("Excel file exported successfully!");
    };

    const clearAllData = () => {
        const promise = new Promise((resolve, reject) => {
            const confirmed = window.confirm(
                "Are you sure you want to clear all data? This action cannot be undone."
            );
            if (confirmed) {
                setStudents([]);
                resolve("Data cleared successfully");
            } else {
                reject("Operation cancelled");
            }
        });

        toast.promise(promise, {
            loading: "Clearing data...",
            success: "All data cleared successfully!",
            error: "Operation cancelled",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 text-black">
            <Toaster position="bottom-right" />
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6 text-black">
                    <div className="mb-4 flex justify-end">
                        <a
                            href="/presentation-shortcut"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Go to Shortcut Entry
                        </a>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                Presentation Marks Entry
                            </h1>
                            <p className="text-gray-600">
                                Simple mark entry - One mark per student
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={clearAllData}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Presentation Selection and Max Mark */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Presentation
                                </label>
                                <select
                                    value={selectedPresentation}
                                    onChange={(e) => setSelectedPresentation(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                >
                                    {Array.from({ length: 1 }, (_, i) => i + 1).map((num) => (
                                        <option key={num} value={`Presentation-${num}`}>
                                            Presentation-{num}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Mark
                                </label>
                                <input
                                    type="number"
                                    value={maxMark}
                                    onChange={(e) => setMaxMark(parseInt(e.target.value) || 8)}
                                    min="1"
                                    max="100"
                                    readOnly
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mark Entry Form */}
                    <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">
                            Add Student Mark
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student ID
                                </label>
                                <input
                                    type="text"
                                    value={currentStudentId}
                                    onChange={(e) => setCurrentStudentId(e.target.value)}
                                    placeholder="Enter student ID"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student Name
                                </label>
                                <input
                                    type="text"
                                    value={currentStudentName}
                                    onChange={(e) => setCurrentStudentName(e.target.value)}
                                    placeholder="Enter student name"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                />
                            </div> */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mark (out of {maxMark})
                                </label>
                                <input
                                    type="number"
                                    value={currentMark}
                                    onChange={(e) => setCurrentMark(e.target.value)}
                                    placeholder={`0 - ${maxMark}`}
                                    min="0"
                                    max={maxMark}
                                    step="0.5"
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
                    </div>

                    {/* Students Table */}
                    {students.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">
                                    Student Marks ({students.length} students)
                                </h3>
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
                                            <th className="border border-gray-300 p-2 text-left">
                                                Student ID
                                            </th>
                                            {/* <th className="border border-gray-300 p-2 text-left">
                                                Student Name
                                            </th> */}
                                            <th className="border border-gray-300 p-2 text-center">
                                                Mark (/{maxMark})
                                            </th>
                                            <th className="border border-gray-300 p-2 text-center">
                                                Percentage
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
                                                <td className="border border-gray-300 p-2 font-medium">
                                                    {student.studentId}
                                                </td>
                                                {/* <td className="border border-gray-300 p-2">
                                                    {student.name}
                                                </td> */}
                                                <td className="border border-gray-300 p-2 text-center">
                                                    {editingCell && editingCell.studentId === student.id ? (
                                                        <input
                                                            type="number"
                                                            defaultValue={student.marks[0]}
                                                            min="0"
                                                            max={maxMark}
                                                            step="0.5"
                                                            className="w-full p-1 text-center border border-gray-300 rounded text-black"
                                                            autoFocus
                                                            onBlur={(e) => {
                                                                const newMark = parseFloat(e.target.value) || 0;
                                                                updateStudentMark(student.id, newMark);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    const newMark = parseFloat((e.target as HTMLInputElement).value) || 0;
                                                                    updateStudentMark(student.id, newMark);
                                                                } else if (e.key === "Escape") {
                                                                    setEditingCell(null);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <button
                                                            onClick={() => setEditingCell({ studentId: student.id })}
                                                            className="w-full h-full p-1 hover:bg-blue-100 transition-colors rounded"
                                                            title="Click to edit"
                                                        >
                                                            {student.marks[0]}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="border border-gray-300 p-2 text-center">
                                                    {((student.marks[0] / maxMark) * 100).toFixed(1)}%
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
                                            students.reduce((sum, s) => sum + s.marks[0], 0) / students.length
                                        ).toFixed(1)}/{maxMark}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Highest Score
                                    </div>
                                    <div className="text-xl font-bold text-green-600">
                                        {Math.max(...students.map((s) => s.marks[0]))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Lowest Score
                                    </div>
                                    <div className="text-xl font-bold text-red-600">
                                        {Math.min(...students.map((s) => s.marks[0]))}
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

export default PresentationMarks;
