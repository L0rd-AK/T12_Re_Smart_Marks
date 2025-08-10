import { useState } from "react"
import {
    BookOpen,
    Users,
    Send,
    ExternalLink,
} from "lucide-react"
import CourseDetailsPage from "../CourseDetails/CourseDetails"



// Ensure user type matches expected shape
// type UserInfo = {
//     name: string;
//     email: string;
//     role: string;
//     department: string;
// };


interface Course {
    id: string
    code: string
    title: string
    department: string
    semester: string
    creditHours: number
    moduleLeader: string
    moduleLeaderEmail: string
    enrolledTeachers: string[]
    status: "active" | "inactive"
    documentProgress: number
}

interface AccessRequest {
    id: string
    courseId: string
    courseName: string
    courseCode: string
    teacherName: string
    teacherEmail: string
    requestDate: string
    status: "pending" | "approved" | "rejected"
    message: string
    moduleLeader: string
}




const user = {
    name: "Dr. John Smith",
    email: "john.smith@university.edu",
    // role: "module-leader",
    role: "teacher",
    department: "Computer Science",

}
export default function CoursesPage() {
    const [activeTab, setActiveTab] = useState("all-courses")
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [requestMessage, setRequestMessage] = useState("")
    const [showCourseDetails, setShowCourseDetails] = useState(false)
    const [selectedCourseId, setSelectedCourseId] = useState<string>("")

    // Mock data - in real app this would come from API
    const [courses, setCourses] = useState<Course[]>([
        // Computer Science Courses
        {
            id: "1",
            code: "CSE101",
            title: "Introduction to Programming",
            department: "Computer Science",
            semester: "Spring 2025",
            creditHours: 3,
            moduleLeader: "Dr. Alice Johnson",
            moduleLeaderEmail: "alice.johnson@university.edu",
            enrolledTeachers: ["Dr. John Smith", "Prof. Sarah Wilson"],
            status: "active",
            documentProgress: 85,
        },
        {
            id: "2",
            code: "CSE201",
            title: "Data Structures and Algorithms",
            department: "Computer Science",
            semester: "Spring 2025",
            creditHours: 4,
            moduleLeader: "Dr. Bob Chen",
            moduleLeaderEmail: "bob.chen@university.edu",
            enrolledTeachers: ["Dr. John Smith"],
            status: "active",
            documentProgress: 60,
        },
        {
            id: "3",
            code: "CSE202",
            title: "Object Oriented Programming",
            department: "Computer Science",
            semester: "Spring 2025",
            creditHours: 3,
            moduleLeader: "Dr. Alice Johnson",
            moduleLeaderEmail: "alice.johnson@university.edu",
            enrolledTeachers: ["Prof. Sarah Wilson", "Dr. Mike Davis"],
            status: "active",
            documentProgress: 75,
        },
        {
            id: "4",
            code: "CSE301",
            title: "Database Management Systems",
            department: "Computer Science",
            semester: "Spring 2025",
            creditHours: 3,
            moduleLeader: "Dr. Carol White",
            moduleLeaderEmail: "carol.white@university.edu",
            enrolledTeachers: ["Prof. Sarah Wilson", "Dr. Mike Davis"],
            status: "active",
            documentProgress: 92,
        },
        {
            id: "5",
            code: "CSE302",
            title: "Computer Networks",
            department: "Computer Science",
            semester: "Spring 2025",
            creditHours: 3,
            moduleLeader: "Dr. Bob Chen",
            moduleLeaderEmail: "bob.chen@university.edu",
            enrolledTeachers: ["Dr. Mike Davis"],
            status: "active",
            documentProgress: 45,
        },
        {
            id: "6",
            code: "CSE303",
            title: "Operating Systems",
            department: "Computer Science",
            semester: "Spring 2025",
            creditHours: 3,
            moduleLeader: "Dr. Alice Johnson",
            moduleLeaderEmail: "alice.johnson@university.edu",
            enrolledTeachers: ["Dr. John Smith", "Dr. Mike Davis"],
            status: "active",
            documentProgress: 68,
        },
        {
            id: "7",
            code: "CSE401",
            title: "Software Engineering",
            department: "Computer Science",
            semester: "Spring 2025",
            creditHours: 3,
            moduleLeader: "Dr. Carol White",
            moduleLeaderEmail: "carol.white@university.edu",
            enrolledTeachers: [],
            status: "active",
            documentProgress: 0,
        },
        {
            id: "8",
            code: "CSE403",
            title: "Machine Learning",
            department: "Computer Science",
            semester: "Spring 2025",
            creditHours: 4,
            moduleLeader: "Dr. Bob Chen",
            moduleLeaderEmail: "bob.chen@university.edu",
            enrolledTeachers: ["Prof. Sarah Wilson"],
            status: "active",
            documentProgress: 30,
        },
        // Electrical Engineering Courses
        {
            id: "9",
            code: "EEE101",
            title: "Circuit Analysis",
            department: "Electrical Engineering",
            semester: "Spring 2025",
            creditHours: 3,
            moduleLeader: "Prof. David Lee",
            moduleLeaderEmail: "david.lee@university.edu",
            enrolledTeachers: ["Dr. Lisa Brown"],
            status: "active",
            documentProgress: 78,
        },
        {
            id: "10",
            code: "EEE201",
            title: "Digital Electronics",
            department: "Electrical Engineering",
            semester: "Spring 2025",
            creditHours: 4,
            moduleLeader: "Prof. David Lee",
            moduleLeaderEmail: "david.lee@university.edu",
            enrolledTeachers: ["Dr. Lisa Brown"],
            status: "active",
            documentProgress: 55,
        },
        {
            id: "11",
            code: "EEE202",
            title: "Electromagnetic Fields",
            department: "Electrical Engineering",
            semester: "Spring 2025",
            creditHours: 3,
            moduleLeader: "Prof. David Lee",
            moduleLeaderEmail: "david.lee@university.edu",
            enrolledTeachers: [],
            status: "active",
            documentProgress: 0,
        },
        {
            id: "12",
            code: "EEE301",
            title: "Power Systems",
            department: "Electrical Engineering",
            semester: "Spring 2025",
            creditHours: 4,
            moduleLeader: "Prof. David Lee",
            moduleLeaderEmail: "david.lee@university.edu",
            enrolledTeachers: ["Dr. Lisa Brown"],
            status: "active",
            documentProgress: 82,
        },
    ])

    const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([
        {
            id: "1",
            courseId: "7",
            courseName: "Software Engineering",
            courseCode: "CSE401",
            teacherName: "Dr. John Smith",
            teacherEmail: "john.smith@university.edu",
            requestDate: "2025-01-15",
            status: "pending",
            message: "I would like to teach this course as I have 5 years of industry experience in software development.",
            moduleLeader: "Dr. Carol White",
        },
        {
            id: "2",
            courseId: "8",
            courseName: "Machine Learning",
            courseCode: "CSE403",
            teacherName: "Dr. Mike Davis",
            teacherEmail: "mike.davis@university.edu",
            requestDate: "2025-01-14",
            status: "approved",
            message: "I have completed my PhD in AI and would love to contribute to this course.",
            moduleLeader: "Dr. Bob Chen",
        },
        {
            id: "3",
            courseId: "4",
            courseName: "Database Management Systems",
            courseCode: "CSE301",
            teacherName: "Prof. Sarah Wilson",
            teacherEmail: "sarah.wilson@university.edu",
            requestDate: "2025-01-13",
            status: "pending",
            message: "I have extensive experience with database systems and would like to join this course.",
            moduleLeader: user?.name,
        },
    ])





    // Filter courses based on user's department
    const departmentCourses = courses.filter((course) => course.department === user?.department)
    const myCourses = courses.filter(
        (course) => course.enrolledTeachers.includes(user?.name) || course.moduleLeader === user?.name,
    )

    const myRequests = accessRequests.filter((request) => request.teacherEmail === user?.email)

    const handleRequestAccess = (course: Course) => {
        setSelectedCourse(course)
        setShowRequestModal(true)
    }

    const submitAccessRequest = () => {
        if (!selectedCourse || !requestMessage.trim()) return

        const newRequest: AccessRequest = {
            id: Date.now().toString(),
            courseId: selectedCourse.id,
            courseName: selectedCourse.title,
            courseCode: selectedCourse.code,
            teacherName: user?.name,
            teacherEmail: user?.email,
            requestDate: new Date().toISOString().split("T")[0],
            status: "pending",
            message: requestMessage,
            moduleLeader: selectedCourse.moduleLeader,
        }

        setAccessRequests((prev) => [...prev, newRequest])
        setShowRequestModal(false)
        setRequestMessage("")
        setSelectedCourse(null)
    }


    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <span className="badge bg-green-100 text-green-800 border border-green-200">Approved</span>;
            case "rejected":
                return <span className="badge bg-red-100 text-red-800 border border-red-200">Rejected</span>;
            case "complete":
                return <span className="badge bg-green-100 text-green-800 border border-green-200">Complete</span>;
            case "incomplete":
                return <span className="badge bg-orange-100 text-orange-800 border border-orange-200">Incomplete</span>;
            default:
                return <span className="badge bg-yellow-100 text-yellow-800 border border-yellow-200">Pending</span>;
        }
    };




    const handleViewCourseDetails = (courseId: string) => {
        setSelectedCourseId(courseId)
        setShowCourseDetails(true)
    }

    if (showCourseDetails) {
        return (
            <CourseDetailsPage courseId={selectedCourseId} userInfo={user} onBack={() => setShowCourseDetails(false)} />
        )
    }

    return (
        <div className=" bg-gray-50 min-h-[calc(100vh-64px)] p-6">
            <div className="container mx-auto space-y-6">

            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-2">
                    Course Management System
                </h1>
                <p className="text-gray-700">Manage courses, access requests, and materials for {user?.department}</p>
            </div>

            {/* Tabs */}
            <div className="w-full">
                <div role="tablist" className="tabs tabs-boxed bg-gray-100 backdrop-blur-sm shadow-lg   grid grid-cols-3  justify-center items-center ">
                    <button
                        role="tab"
                        className={`tab flex items-center gap-2 ${activeTab === "all-courses" ? "tab-active !bg-indigo-600 !text-white" : "!text-gray-700 hover:!bg-indigo-100"}`}
                        onClick={() => setActiveTab("all-courses")}
                    >
                        <BookOpen className="w-4 h-4" />
                        All Courses
                    </button>

                    <button
                        role="tab"
                        className={`tab flex items-center gap-2 ${activeTab === "my-courses" ? "tab-active !bg-green-600 !text-white" : "!text-gray-700 hover:!bg-green-100"}`}
                        onClick={() => setActiveTab("my-courses")}
                    >
                        <Users className="w-4 h-4" />
                        My Courses
                    </button>

                    <button
                        role="tab"
                        className={`tab flex items-center gap-2 ${activeTab === "requests" ? "tab-active !bg-purple-600 !text-white" : "!text-gray-700 hover:!bg-purple-100"}`}
                        onClick={() => setActiveTab("requests")}
                    >
                        <Send className="w-4 h-4" />
                        Access Requests
                    </button>

            
                </div>
                <div className="mt-10">

                    {/* All Courses Tab */}
                    {activeTab === "all-courses" && <div className="space-y-6">
                        <div className="card bg-white/90 backdrop-blur-sm shadow-xl border-0">
                            <div className="card-body">
                                <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-indigo-600" />
                                    Department Courses - {user?.department}
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
                                                const isDisabled = !course.enrolledTeachers.includes(user?.name) && course.moduleLeader !== user?.name;
                                                return (
                                                    <tr
                                                        key={course.id}
                                                        className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-indigo-50/60"} hover:bg-indigo-100/70`}
                                                    >
                                                        <td className={`font-medium text-indigo-700 ${isDisabled ? "opacity-70" : ""}`}>{course.code}</td>
                                                        <td className={`${isDisabled ? "text-gray-400" : "text-gray-900"}`}>{course.title}</td>
                                                        <td className={`${isDisabled ? "text-gray-400" : "text-gray-900"}`}>{course.creditHours}</td>
                                                        <td className={`${isDisabled ? "text-gray-400" : "text-gray-900"}`}>{course.moduleLeader}</td>
                                                        <td>
                                                            <div className="flex gap-2">
                                                                {(course.enrolledTeachers.includes(user?.name) ||
                                                                    course.moduleLeader === user?.name) && (
                                                                        <button
                                                                            onClick={() => handleViewCourseDetails(course.id)}
                                                                            className="btn btn-sm border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white px-5"
                                                                        >
                                                                            <ExternalLink className="w-4 h-4 mr-2" />
                                                                            View Details
                                                                        </button>
                                                                    )}
                                                                {!course.enrolledTeachers.includes(user?.name) &&
                                                                    course.moduleLeader !== user?.name && (
                                                                        <button
                                                                            onClick={() => handleRequestAccess(course)}
                                                                            className="btn btn-sm border-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white"
                                                                        >
                                                                            <Send className="w-4 h-4 mr-2" />
                                                                            Request Access
                                                                        </button>
                                                                    )}
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
                    </div>}
                    {/* My Courses Tab */}
                    {activeTab === "my-courses" && <div className="space-y-6">
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
                                                <th className="font-semibold text-emerald-900">Role</th>
                                                <th className="font-semibold text-emerald-900">Status</th>
                                                <th className="font-semibold text-emerald-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myCourses.map((course, idx) => (
                                                <tr
                                                    key={course.id}
                                                    className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-emerald-50/60"} hover:bg-emerald-100/70`}
                                                >
                                                    <td className="font-medium text-emerald-700">{course.code}</td>
                                                    <td className="text-gray-900">{course.title}</td>
                                                    <td>
                                                        {course.moduleLeader === user?.name ? (
                                                            <span className="badge bg-purple-600/10 text-purple-800 border border-purple-300">Module Leader</span>
                                                        ) : (
                                                            <span className="badge bg-indigo-600/10 text-indigo-800 border border-indigo-300">Teacher</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {course.documentProgress >= 90 ? (
                                                            <span className="badge bg-emerald-600/10 text-emerald-800 border border-emerald-300">Complete</span>
                                                        ) : course.documentProgress >= 50 ? (
                                                            <span className="badge bg-yellow-400/10 text-yellow-800 border border-yellow-300">In Progress</span>
                                                        ) : (
                                                            <span className="badge bg-rose-600/10 text-rose-800 border border-rose-300">Incomplete</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleViewCourseDetails(course.id)}
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
                    </div>}
                    {/* Access Requests Tab */}
                    {activeTab === "requests" && <div className="space-y-6">
                        <div className="">

                            {/* My Requests */}
                            <div className="card shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                                <div className="card-body space-y-4">
                                    <h2 className="card-title text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Send className="w-5 h-5 text-purple-600" />
                                        My Requests
                                    </h2>
                                    <p className="text-gray-700">Your access requests to other courses</p>

                                    {myRequests.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No requests sent</p>
                                    ) : (
                                        myRequests.map((request) => (
                                            <div key={request.id} className="border border-purple-200 rounded-lg p-4 space-y-3 bg-purple-50/30">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-purple-600">{request.courseName}</h4>
                                                        <p className="text-sm text-gray-600">{request.courseCode}</p>
                                                        <p className="text-sm text-gray-600">To: {request.moduleLeader}</p>
                                                    </div>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <p className="text-sm text-gray-700">{request.message}</p>
                                                <p className="text-xs text-gray-500">Sent: {request.requestDate}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>

            </div>


            {/* Access Request Modal */}
            {showRequestModal && (
                <div className="modal modal-open">
                    <div className="modal-box bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-md">
                        <h3 className="font-bold text-xl text-gray-900">Request Course Access</h3>
                        <p className="text-gray-700 mb-4">
                            Send a request to join <span className="font-medium">{selectedCourse?.code}</span> - {selectedCourse?.title}
                        </p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700 block">
                                    Message to Module Leader
                                </label>
                                <textarea
                                    id="message"
                                    value={requestMessage}
                                    onChange={(e) => setRequestMessage(e.target.value)}
                                    placeholder="Explain why you want to teach this course..."
                                    className="textarea textarea-bordered w-full min-h-[100px] focus:border-indigo-500 focus:ring-indigo-500"
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
                                className="btn bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                                disabled={!requestMessage.trim()}
                                onClick={submitAccessRequest}
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>



        </div>
    )
}
