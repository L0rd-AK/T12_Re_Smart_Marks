/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import {
    BookOpen,
    Users,
    Send,
    ExternalLink,
    Check,
    X,
    Clock,
} from "lucide-react"
import CourseDetailsPage from "../CourseDetails/CourseDetails"
import {
    useGetMyCoursesQuery,
    useGetDepartmentCoursesQuery,
    useGetMyRequestsQuery,
    useGetPendingRequestsQuery,
    useCreateAccessRequestMutation,
    useRespondToRequestMutation,
    type Course,
    type CourseAccessRequest,
} from "../../redux/api/courseAccessApi"
import {
    useGetSharedDocumentsQuery,
    useGetCourseDocumentDistributionsQuery,
} from "../../redux/api/documentDistributionApi"
import { useAppSelector } from "../../redux/hooks"
import LoadingSpinner from "../../components/LoadingSpinner"
import { toast } from "sonner"


export default function CoursesPage() {
    const [activeTab, setActiveTab] = useState("all-courses")
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [requestMessage, setRequestMessage] = useState("")
    const [showCourseDetails, setShowCourseDetails] = useState(false)
    const [selectedCourseId, setSelectedCourseId] = useState<string>("")
    const [showResponseModal, setShowResponseModal] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<CourseAccessRequest | null>(null)
    const [responseMessage, setResponseMessage] = useState("")
    const [section, setSection] = useState<string>("")
    const [semester, setSemester] = useState<"Spring" | "Fall" | "Summer" | "">("")
    const [batch, setBatch] = useState<number>()
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
    // Get user info from Redux store
    const user = useAppSelector((state) => state.auth.user)

    // API hooks
    const { data: myCoursesData, isLoading: myCoursesLoading } = useGetMyCoursesQuery()
    const { data: departmentCoursesData, isLoading: departmentCoursesLoading } = useGetDepartmentCoursesQuery()
    const { data: myRequestsData, isLoading: myRequestsLoading } = useGetMyRequestsQuery()
    const { data: pendingRequestsData, isLoading: pendingRequestsLoading } = useGetPendingRequestsQuery(
        undefined,
        { skip: user?.role !== 'module-leader' }
    )

    const [createAccessRequest, { isLoading: isCreatingRequest }] = useCreateAccessRequestMutation()
    const [respondToRequest, { isLoading: isResponding }] = useRespondToRequestMutation()

    // Document distribution APIs
    const { data: sharedDocumentsData, isLoading: sharedDocumentsLoading } = useGetSharedDocumentsQuery(
        undefined,
        { skip: user?.role !== 'teacher' }
    )
    const { data: courseDocumentsData, isLoading: courseDocumentsLoading } = useGetCourseDocumentDistributionsQuery(
        selectedRequest?.course._id || '',
        { skip: !selectedRequest || user?.role !== 'module-leader' }
    )

    const myCourses = myCoursesData?.data || []
    const departmentCourses = departmentCoursesData?.data || []
    const myRequests = myRequestsData?.data || []
    const pendingRequests = pendingRequestsData?.data || []
    const sharedDocuments = sharedDocumentsData?.data || []
    const courseDocuments = courseDocumentsData?.data || []
    console.log("myCourses", myCourses)
    const handleRequestAccess = (course: Course) => {
        setSelectedCourse(course)
        setShowRequestModal(true)
    }

    const submitAccessRequest = async () => {
        if (!selectedCourse || !requestMessage.trim() || !batch || !section) return

        try {
            await createAccessRequest({
                courseId: selectedCourse?._id,
                data: {
                    message: requestMessage,
                    moduleLeaderId: selectedCourse?.moduleLeader?._id ?? "",
                    batch: batch,
                    section: section,
                    semester: semester
                }
            }).unwrap()

            setShowRequestModal(false)
            setRequestMessage("")
            setSelectedCourse(null)

            // Show success message
            toast.success('Access request sent successfully!')
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? (error.data as { message?: string })?.message || 'Failed to send request'
                : 'Failed to send request'
            toast.error(errorMessage)
        }
    }

    const handleRespondToRequest = (request: CourseAccessRequest) => {
        setSelectedRequest(request)
        setShowResponseModal(true)
    }

    const submitResponse = async (status: 'approved' | 'rejected') => {
        if (!selectedRequest) return

        try {
            console.log({
                requestId: selectedRequest._id,
                status,
                responseMessage: responseMessage,
                selectedDocuments: selectedDocuments
            })
            await respondToRequest({
                requestId: selectedRequest._id,
                data: {
                    status,
                    responseMessage: responseMessage,
                    selectedDocuments: status === 'approved' ? selectedDocuments : undefined
                }

            }).unwrap()

            setShowResponseModal(false)
            setResponseMessage("")
            setSelectedRequest(null)
            setSelectedDocuments([])

            // Show success message
            toast.success(`Request ${status} successfully!`)
        } catch (error: unknown) {
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? (error.data as { message?: string })?.message || 'Failed to respond to request'
                : 'Failed to respond to request'
            toast.error(errorMessage)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <span className="badge bg-green-100 text-green-800 border border-green-200">Approved</span>;
            case "rejected":
                return <span className="badge bg-red-100 text-red-800 border border-red-200">Rejected</span>;
            default:
                return <span className="badge bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>;
        }
    }

    const handleViewCourseDetails = (courseId: string) => {
        setSelectedCourseId(courseId)
        setShowCourseDetails(true)
    }

    if (showCourseDetails && user) {
        return (
            <CourseDetailsPage
                courseId={selectedCourseId}
                userInfo={{
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department || 'Unknown'
                }}
                onBack={() => setShowCourseDetails(false)}
            />
        )
    }

    const isLoading = myCoursesLoading || departmentCoursesLoading || myRequestsLoading || pendingRequestsLoading || sharedDocumentsLoading

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-[calc(100vh-64px)] p-6">
            <div className="container mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-2">
                        Course Management System
                    </h1>
                    <p className="text-gray-700">Manage courses, access requests, and materials</p>
                </div>

                {/* Tabs */}
                <div className="w-full">
                    <div role="tablist" className="tabs tabs-boxed bg-gray-100 backdrop-blur-sm shadow-lg grid grid-cols-4 justify-center items-center">
                        <button
                            role="tab"
                            className={`tab flex-1 flex items-center gap-2 ${activeTab === "all-courses" ? "tab-active !bg-indigo-600 !text-white" : "!text-gray-700 hover:!bg-indigo-100"}`}
                            onClick={() => setActiveTab("all-courses")}
                        >
                            <BookOpen className="w-4 h-4" />
                            All Courses
                        </button>

                        <button
                            role="tab"
                            className={`tab flex-1 flex items-center gap-2 ${activeTab === "my-courses" ? "tab-active !bg-green-600 !text-white" : "!text-gray-700 hover:!bg-green-100"}`}
                            onClick={() => setActiveTab("my-courses")}
                        >
                            <Users className="w-4 h-4" />
                            My Courses
                        </button>

                        <button
                            role="tab"
                            className={`tab flex-1 flex items-center gap-2 ${activeTab === "requests" ? "tab-active !bg-purple-600 !text-white" : "!text-gray-700 hover:!bg-purple-100"}`}
                            onClick={() => setActiveTab("requests")}
                        >
                            <Send className="w-4 h-4" />
                            My Requests
                        </button>

                        {user?.role === 'module-leader' && (
                            <button
                                role="tab"
                                className={`tab flex-1 flex items-center gap-2 ${activeTab === "pending-requests" ? "tab-active !bg-orange-600 !text-white" : "!text-gray-700 hover:!bg-orange-100"}`}
                                onClick={() => setActiveTab("pending-requests")}
                            >
                                <Clock className="w-4 h-4" />
                                Pending Requests
                                {pendingRequests.length > 0 && (
                                    <span className="badge badge-sm bg-red-500 text-white border-none">
                                        {pendingRequests.length}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    <div className="mt-10">
                        {/* All Courses Tab */}
                        {activeTab === "all-courses" && (
                            <div className="space-y-6">
                                <div className="card bg-white/90 backdrop-blur-sm shadow-xl border-0">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                            <BookOpen className="w-6 h-6 text-indigo-600" />
                                            Department Courses
                                        </h2>
                                        <p className="text-gray-700">All courses available in your department</p>

                                        <div className="overflow-x-auto mt-4">
                                            <table className="table w-full border-separate border-spacing-0 rounded-lg overflow-hidden">
                                                <thead>
                                                    <tr className="bg-indigo-100/80">
                                                        <th className="font-semibold text-indigo-900">Course Code</th>
                                                        <th className="font-semibold text-indigo-900">Course Title</th>
                                                        <th className="font-semibold text-indigo-900">Credit Hours</th>
                                                        <th className="font-semibold text-indigo-900">Module Leader</th>
                                                        <th className="font-semibold text-indigo-900">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {departmentCourses.map((course, idx) => {
                                                        return (
                                                            <tr
                                                                key={idx}
                                                                className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-indigo-50/60"} hover:bg-indigo-100/70`}
                                                            >
                                                                <td className={`font-medium text-indigo-700 `}>{course.code}</td>
                                                                <td className={`text-gray-900`}>{course.name}</td>
                                                                <td className={`text-gray-900`}>{course.creditHours}</td>
                                                                <td className={`text-gray-900`}>{course?.moduleLeader?.name}</td>
                                                                <td>
                                                                    <div className="flex gap-2">
                                                                        {
                                                                            myCourses.some(c => c._id === course._id) ? (<button
                                                                                onClick={() => handleViewCourseDetails(course._id)}
                                                                                className="btn btn-sm border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white px-5"
                                                                            >
                                                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                                                View Details
                                                                            </button>) : (<button
                                                                                onClick={() => handleRequestAccess(course)}
                                                                                className="btn btn-sm border-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white"
                                                                            >
                                                                                <Send className="w-4 h-4 mr-2" />
                                                                                Request Access
                                                                            </button>)
                                                                        }

                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* My Courses Tab */}
                        {activeTab === "my-courses" && (
                            <div className="space-y-6">
                                <div className="card shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                            <Users className="w-6 h-6 text-emerald-600" />
                                            My Enrolled Courses
                                        </h2>
                                        <p className="text-gray-700">Courses you are teaching or leading</p>

                                        <div className="overflow-x-auto mt-4">
                                            <table className="table w-full border-separate border-spacing-0 rounded-lg overflow-hidden">
                                                <thead>
                                                    <tr className="bg-emerald-100/80">
                                                        <th className="font-semibold text-emerald-900">Course Code</th>
                                                        <th className="font-semibold text-emerald-900">Course Title</th>
                                                        <th className="font-semibold text-indigo-900">Credit Hours</th>
                                                        <th className="font-semibold text-emerald-900">Role</th>
                                                        <th className="font-semibold text-emerald-900">Semester</th>
                                                        <th className="font-semibold text-emerald-900">Batch</th>
                                                        <th className="font-semibold text-emerald-900">Module Leader</th>
                                                        <th className="font-semibold text-emerald-900">Status</th>
                                                        <th className="font-semibold text-emerald-900">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {myCourses.map((course: any, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-emerald-50/60"} hover:bg-emerald-100/70`}
                                                        >
                                                            <td className="font-medium text-emerald-700">{course.code}</td>
                                                            <td className="text-gray-900">{course.name}</td>
                                                            <td className={`text-gray-900`}>{course.creditHours}</td>
                                                            <td>
                                                                {course?.moduleLeader?.name === user?.name ? (
                                                                    <span className="badge bg-purple-600/10 text-purple-800 border border-purple-300">Module Leader</span>
                                                                ) : (
                                                                    <span className="badge bg-indigo-600/10 text-indigo-800 border border-indigo-300">Teacher</span>
                                                                )}
                                                            </td>
                                                            <td className="text-gray-900">{course.semester}-{course.year}</td>
                                                            <td className="text-gray-900">{course.batch}</td>
                                                            <td className="text-gray-900">{course?.moduleLeader.name}({course?.moduleLeader.initial})</td>
                                                            <td>
                                                                {course.status == "ongoing" ? (
                                                                    <span className="badge bg-emerald-600/10 text-emerald-800 border border-emerald-300">Ongoing</span>
                                                                ) : (
                                                                    <span className="badge bg-yellow-400/10 text-yellow-800 border border-yellow-300">Completed</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    onClick={() => handleViewCourseDetails(course._id)}
                                                                    className="btn btn-sm border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                >
                                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                                    View Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* My Requests Tab */}
                        {activeTab === "requests" && (
                            <div className="space-y-6">
                                <div className="card shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                                    <div className="card-body space-y-4">
                                        <h2 className="card-title text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Send className="w-5 h-5 text-purple-600" />
                                            My Access Requests
                                        </h2>
                                        <p className="text-gray-700">Your access requests to courses</p>

                                        {myRequests.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No requests sent</p>
                                        ) : (
                                            myRequests.map((request, idx) => (
                                                <div key={idx} className="border border-purple-200 rounded-lg p-4 space-y-3 bg-purple-50/30">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-purple-600">{request.course.name}</h4>
                                                            <p className="text-sm text-gray-600">{request.course.code}</p>
                                                            <p className="text-sm text-gray-600">To: {request.moduleLeader.name}</p>
                                                        </div>
                                                        {getStatusBadge(request.status)}
                                                    </div>
                                                    <p className="text-sm text-gray-700">{request.message}</p>
                                                    {request.responseMessage && (
                                                        <div className="mt-2 p-2 bg-gray-100 rounded">
                                                            <p className="text-sm font-medium text-gray-700">Response:</p>
                                                            <p className="text-sm text-gray-600">{request.responseMessage}</p>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-gray-500">Sent: {new Date(request.requestDate).toLocaleDateString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Shared Documents Section (for teachers) */}
                                {user?.role === 'teacher' && (
                                    <div className="card shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                                        <div className="card-body space-y-4">
                                            <h2 className="card-title text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                                Shared Documents
                                            </h2>
                                            <p className="text-gray-700">Documents shared with you by module leaders</p>

                                            {sharedDocumentsLoading ? (
                                                <div className="flex justify-center py-8">
                                                    <LoadingSpinner />
                                                </div>
                                            ) : sharedDocuments.length === 0 ? (
                                                <p className="text-gray-500 text-center py-8">No shared documents available</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {sharedDocuments.map((document, idx) => (
                                                        <div key={idx} className="border border-blue-200 rounded-lg p-4 space-y-3 bg-blue-50/30">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-medium text-blue-600">{document.title}</h4>
                                                                    <p className="text-sm text-gray-600">{document.course.courseCode} - {document.course.courseName}</p>
                                                                    <p className="text-sm text-gray-600">From: {document.moduleLeader.name}</p>
                                                                    <p className="text-sm text-gray-500">{document.description}</p>
                                                                </div>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <span className="badge bg-blue-100 text-blue-800 border border-blue-200">
                                                                        {document.category}
                                                                    </span>
                                                                    <span className="badge bg-green-100 text-green-800 border border-green-200">
                                                                        {document.fileCount} file(s)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* File list */}
                                                            {document.files && document.files.length > 0 && (
                                                                <div className="mt-3">
                                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Files:</h5>
                                                                    <div className="space-y-2">
                                                                        {document.files.map((file, fileIdx) => (
                                                                            <div key={fileIdx} className="flex items-center justify-between p-2 bg-white rounded border">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-sm text-gray-600">{file.originalName}</span>
                                                                                    <span className="text-xs text-gray-500">({(file.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                                                                                </div>
                                                                                <div className="flex gap-2">
                                                                                    {document.teacherPermissions?.canView && (
                                                                                        <a
                                                                                            href={file.liveViewLink}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="btn btn-xs btn-outline btn-primary"
                                                                                        >
                                                                                            <ExternalLink className="w-3 h-3" />
                                                                                            View
                                                                                        </a>
                                                                                    )}
                                                                                    {document.teacherPermissions?.canDownload && (
                                                                                        <a
                                                                                            href={file.downloadLink}
                                                                                            download
                                                                                            className="btn btn-xs btn-outline btn-success"
                                                                                        >
                                                                                            Download
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            <p className="text-xs text-gray-500">
                                                                Shared: {new Date(document.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pending Requests Tab (Module Leader Only) */}
                        {activeTab === "pending-requests" && user?.role === 'module-leader' && (
                            <div className="space-y-6">
                                <div className="card shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                                    <div className="card-body space-y-4">
                                        <h2 className="card-title text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                            Pending Access Requests
                                        </h2>
                                        <p className="text-gray-700">Requests awaiting your approval</p>

                                        {pendingRequests.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No pending requests</p>
                                        ) : (
                                            pendingRequests.map((request, idx) => (
                                                <div key={idx} className="border border-orange-200 rounded-lg p-4 space-y-3 bg-orange-50/30">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-orange-600">{request.course.name}</h4>
                                                            <p className="text-sm text-gray-600">{request.course.code}</p>
                                                            <p className="text-sm text-gray-600">From: {request.teacher.name}</p>
                                                            <p className="text-sm text-gray-500">{request.teacher.email}</p>
                                                        </div>
                                                        <span className="badge bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{request.message}</p>
                                                    <p className="text-xs text-gray-500">Requested: {new Date(request.requestDate).toLocaleDateString()}</p>

                                                    <div className="flex gap-2 mt-4">
                                                        <button
                                                            onClick={() => handleRespondToRequest(request)}
                                                            className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none"
                                                        >
                                                            <Check className="w-4 h-4 mr-1" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(request)
                                                                submitResponse('rejected')
                                                            }}
                                                            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none"
                                                        >
                                                            <X className="w-4 h-4 mr-1" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Access Request Modal */}
                {showRequestModal && (
                    <div className="modal modal-open">
                        <div className="modal-box bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-lg">
                            <h3 className="font-bold text-xl text-gray-900">Request Course Access</h3>
                            <p className="text-gray-700 mb-4">
                                Send a request to join <span className="font-medium">{selectedCourse?.code}</span> - {selectedCourse?.name}
                            </p>
                            {/* Module Leader information */}
                            <div className="mb-4 p-3 bg-indigo-50 rounded-lg ">
                                <span className="font-semibold text-indigo-700">Module Leader Information:</span>
                                <div>
                                    <p className="text-gray-600 text-sm"><strong>Name:</strong> {selectedCourse?.moduleLeader?.name || "Unknown"}</p>
                                    <p className="text-sm text-gray-600"><strong>Email:</strong> {selectedCourse?.moduleLeader?.email || "No email"}</p>
                                    <p className="text-sm text-gray-600"><strong>Phone:</strong> {selectedCourse?.moduleLeader?.mobileNumber || "No phone number"}</p>
                                </div>
                            </div>
                            <div className="sm:flex sm:justify-between sm:items-center mb-4 gap-4">
                                {/* batch dropdown */}
                                <div className="mb-4 flex-1 ">
                                    <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                                    <select
                                        id="batch"
                                        value={batch || ""}
                                        onChange={(e) => setBatch(Number(e.target.value))}
                                        className="select select-bordered w-full focus:border-indigo-500 focus:ring-indigo-500 bg-white text-black drop-shadow-sm"
                                    >
                                        <option value="" disabled>Select Batch</option>
                                        {[1, 2, 3, 4, 5].map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Semester dropdown */}
                                <div className="mb-4 flex-1 ">
                                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                                    <select
                                        id="semester"
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value as "Spring" | "Fall" | "Summer")}
                                        className="select select-bordered w-full focus:border-indigo-500 focus:ring-indigo-500 bg-white text-black drop-shadow-sm"
                                    >
                                        <option value="">Select Semester</option>
                                        <option value="Spring">Spring</option>
                                        <option value="Summer">Summer</option>
                                        <option value="Fall">Fall</option>
                                    </select>
                                </div>
                                {/* Section dropdown */}
                                <div className="mb-4 flex-1 ">
                                    <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                                    <select
                                        id="section"
                                        value={section}
                                        onChange={(e) => setSection(e.target.value)}
                                        className="select select-bordered w-full focus:border-indigo-500 focus:ring-indigo-500 bg-white text-black drop-shadow-sm"
                                    >
                                        <option value="">Select Section</option>
                                        <option value="S">S</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-gray-700 block">
                                        Message to Module Leader
                                    </label>
                                    <textarea
                                        id="message"
                                        value={requestMessage}
                                        onChange={(e) => setRequestMessage(e.target.value)}
                                        placeholder="If anything want to say write here..."
                                        className="textarea textarea-bordered w-full min-h-[100px] focus:border-indigo-500 focus:ring-indigo-500 bg-white text-black drop-shadow-sm"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="modal-action">
                                <button
                                    className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-100"
                                    onClick={() => setShowRequestModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 border-none"
                                    disabled={!requestMessage.trim() || isCreatingRequest}
                                    onClick={submitAccessRequest}
                                >
                                    {isCreatingRequest ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Response Modal */}
                {showResponseModal && selectedRequest && (
                    <div className="modal modal-open">
                        <div className="modal-box bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-2xl">
                            <h3 className="font-bold text-xl text-gray-900">Respond to Request</h3>
                            <p className="text-gray-700 mb-4">
                                Request from <span className="font-medium">{selectedRequest.teacher.name}</span> for {selectedRequest.course.code}
                            </p>

                            <div className="space-y-4">
                                <div className="p-3 bg-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-700">{selectedRequest.message}</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="responseMessage" className="text-sm font-medium text-gray-700 block">
                                        Response Message (Optional)
                                    </label>
                                    <textarea
                                        id="responseMessage"
                                        value={responseMessage}
                                        onChange={(e) => setResponseMessage(e.target.value)}
                                        placeholder="Add a message for the teacher..."
                                        className="textarea textarea-bordered w-full min-h-[80px] focus:border-indigo-500 focus:ring-indigo-500 bg-white text-black drop-shadow-sm"
                                    ></textarea>
                                </div>

                                {/* Document Selection Section */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Select Documents to Share (Optional)
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Choose which documents to share with the teacher when approving their request
                                    </p>
                                    
                                    {courseDocumentsLoading ? (
                                        <div className="flex justify-center py-4">
                                            <LoadingSpinner />
                                        </div>
                                    ) : courseDocuments.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No documents available for this course</p>
                                    ) : (
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {courseDocuments.map((document, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                                                    <input
                                                        type="checkbox"
                                                        id={`doc-${idx}`}
                                                        checked={selectedDocuments.includes(document.distributionId)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedDocuments([...selectedDocuments, document.distributionId])
                                                            } else {
                                                                setSelectedDocuments(selectedDocuments.filter(id => id !== document.distributionId))
                                                            }
                                                        }}
                                                        className="checkbox checkbox-primary"
                                                    />
                                                    <label htmlFor={`doc-${idx}`} className="flex-1 cursor-pointer">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{document.title}</p>
                                                            <p className="text-sm text-gray-600">{document.category} • {document.fileCount} file(s)</p>
                                                            <p className="text-xs text-gray-500">{document.description}</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-action">
                                <button
                                    className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                        setShowResponseModal(false)
                                        setSelectedDocuments([])
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn bg-red-600 hover:bg-red-700 text-white border-none"
                                    disabled={isResponding}
                                    onClick={() => submitResponse('rejected')}
                                >
                                    {isResponding ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <>
                                            <X className="w-4 h-4 mr-2" />
                                            Reject
                                        </>
                                    )}
                                </button>
                                <button
                                    className="btn bg-green-600 hover:bg-green-700 text-white border-none"
                                    disabled={isResponding}
                                    onClick={() => submitResponse('approved')}
                                >
                                    {isResponding ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Approve
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
