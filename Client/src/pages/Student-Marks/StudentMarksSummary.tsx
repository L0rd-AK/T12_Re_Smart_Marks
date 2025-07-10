/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useGetStudentMarksSummaryQuery } from '../../redux/api/marksApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const StudentMarksSummary = () => {
    const [studentId, setStudentId] = useState('');
    const [search, setSearch] = useState('');

    const { data: summary, isLoading, error } = useGetStudentMarksSummaryQuery(studentId, {
        skip: !studentId,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setStudentId(search);
    };
    return (
        <div className="container mx-auto p-4  h-[calc(100vh-300px)]">
            <h1 className="text-2xl font-bold mb-6 text-center">Student Marks Summary</h1>

            <form onSubmit={handleSearch} className="mb-8 flex gap-2 w-full justify-center items-start">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Enter Student ID"
                    className="input input-bordered w-full max-w-xs"
                    required
                />
                <button type="submit" className="btn btn-primary">
                    Search
                </button>
            </form>

            {isLoading && <LoadingSpinner />}

            {error && (
                <div className="alert alert-error">
                    <p>Error: {(error as any).data?.message || 'Failed to fetch student data'}</p>
                </div>
            )}

            {summary && (
                <div className="grid gap-8">
                    <div className="card bg-base-200 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Student Information</h2>
                            <p><strong>Student ID:</strong> {summary.studentId}</p>
                            <p><strong>Name:</strong> {summary.name}</p>
                            <p><strong>Overall Average:</strong> {summary.overall?.average?.toFixed(2) || '0.00'}</p>
                            <p><strong>Total Assessments:</strong> {summary.overall?.totalMarks || 0}</p>
                        </div>
                    </div>

                    {/* Weighted Grade Summary */}
                    <div className="card bg-primary text-primary-content shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-2xl">Final Weighted Grade</h2>
                            <div className="text-4xl font-bold mb-4">
                                {summary.overall?.finalGrade?.toFixed(2) || '0.00'}%
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p><strong>Quiz:</strong> {summary.quizzes?.weightedScore?.toFixed(2) || '0.00'} / {summary.quizzes?.weight || 0}</p>
                                </div>
                                <div>
                                    <p><strong>Midterm:</strong> {summary.midterms?.weightedScore?.toFixed(2) || '0.00'} / {summary.midterms?.weight || 0}</p>
                                </div>
                                <div>
                                    <p><strong>Final:</strong> {summary.finals?.weightedScore?.toFixed(2) || '0.00'} / {summary.finals?.weight || 0}</p>
                                </div>
                                <div>
                                    <p><strong>Assignment:</strong> {summary.assignments?.weightedScore?.toFixed(2) || '0.00'} / {summary.assignments?.weight || 0}</p>
                                </div>
                                <div>
                                    <p><strong>Presentation:</strong> {summary.presentations?.weightedScore?.toFixed(2) || '0.00'} / {summary.presentations?.weight || 0}</p>
                                </div>
                                <div>
                                    <p><strong>Attendance:</strong> {summary.attendance?.weightedScore?.toFixed(2) || '0.00'} / {summary.attendance?.weight || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {/* Quiz Marks */}
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Quiz Marks</h2>
                                <p><strong>Count:</strong> {summary.quizzes?.count || 0}</p>
                                <p><strong>Average:</strong> {summary.quizzes?.average?.toFixed(2) || '0.00'}</p>

                                {summary.quizzes?.marks?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Score</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary.quizzes?.marks?.map((mark) => (
                                                    <tr key={mark.id}>
                                                        <td>{mark.formatName}</td>
                                                        <td>{mark.total}</td>
                                                        <td>{new Date(mark.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No quiz marks recorded</p>
                                )}
                            </div>
                        </div>

                        {/* Midterm Marks */}
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Midterm Marks</h2>
                                <p><strong>Count:</strong> {summary.midterms?.count || 0}</p>
                                <p><strong>Average:</strong> {summary.midterms?.average?.toFixed(2) || '0.00'}</p>

                                {summary.midterms?.marks?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Score</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary.midterms?.marks?.map((mark) => (
                                                    <tr key={mark.id}>
                                                        <td>{mark.formatName}</td>
                                                        <td>{mark.total}</td>
                                                        <td>{new Date(mark.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No midterm marks recorded</p>
                                )}
                            </div>
                        </div>

                        {/* Final Marks */}
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Final Marks</h2>
                                <p><strong>Count:</strong> {summary.finals?.count || 0}</p>
                                <p><strong>Average:</strong> {summary.finals?.average?.toFixed(2) || '0.00'}</p>

                                {summary.finals?.marks?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Score</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary.finals?.marks?.map((mark) => (
                                                    <tr key={mark.id}>
                                                        <td>{mark.formatName}</td>
                                                        <td>{mark.total}</td>
                                                        <td>{new Date(mark.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No final marks recorded</p>
                                )}
                            </div>
                        </div>

                        {/* Assignment Marks */}
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Assignment Marks</h2>
                                <p><strong>Count:</strong> {summary.assignments?.count || 0}</p>
                                <p><strong>Average:</strong> {(summary.assignments?.average || 0).toFixed(2)}</p>

                                {summary.assignments && summary.assignments.marks?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Score</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary.assignments?.marks?.map((mark) => (
                                                    <tr key={mark.id}>
                                                        <td>{mark.formatName}</td>
                                                        <td>{mark.total}</td>
                                                        <td>{new Date(mark.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No assignment marks recorded</p>
                                )}
                            </div>
                        </div>

                        {/* Presentation Marks */}
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Presentation Marks</h2>
                                <p><strong>Count:</strong> {summary.presentations?.count || 0}</p>
                                <p><strong>Average:</strong> {(summary.presentations?.average || 0).toFixed(2)}</p>

                                {summary.presentations && summary.presentations.marks?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Score</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary.presentations?.marks?.map((mark) => (
                                                    <tr key={mark.id}>
                                                        <td>{mark.formatName}</td>
                                                        <td>{mark.total}</td>
                                                        <td>{new Date(mark.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No presentation marks recorded</p>
                                )}
                            </div>
                        </div>

                        {/* Attendance Marks */}
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Attendance Marks</h2>
                                <p><strong>Count:</strong> {summary.attendance?.count || 0}</p>
                                <p><strong>Average:</strong> {(summary.attendance?.average || 0).toFixed(2)}</p>

                                {summary.attendance && summary.attendance.marks?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Score</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary.attendance?.marks?.map((mark) => (
                                                    <tr key={mark.id}>
                                                        <td>{mark.formatName}</td>
                                                        <td>{mark.total}</td>
                                                        <td>{new Date(mark.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No attendance marks recorded</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentMarksSummary;
