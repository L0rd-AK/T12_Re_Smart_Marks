"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen,
  Users,
  Send,
  Check,
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  UserCheck,
  Settings,
  ExternalLink,
} from "lucide-react"
import CourseDetailsPage from "./course-details-page"

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

interface CourseMaterial {
  id: string
  courseId: string
  name: string
  type: string
  size: number
  uploadDate: string
  uploadedBy: string
  category: "syllabus" | "lecture" | "assignment" | "exam" | "reference"
  url?: string
}

interface TeacherProgress {
  teacherName: string
  teacherEmail: string
  theoryProgress: number
  labProgress: number
  overallProgress: number
  lastUpdated: string
  status: "complete" | "incomplete" | "pending"
}

interface CoursesPageProps {
  userInfo: {
    name: string
    email: string
    role: string
    department: string
  }
}

export default function CoursesPage({ userInfo }: CoursesPageProps) {
  const [activeTab, setActiveTab] = useState("all-courses")
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
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
      moduleLeader: userInfo.role === "module_leader" ? userInfo.name : "Dr. Carol White",
      moduleLeaderEmail: userInfo.role === "module_leader" ? userInfo.email : "carol.white@university.edu",
      enrolledTeachers:
        userInfo.role === "module_leader"
          ? ["Prof. Sarah Wilson", "Dr. Mike Davis"]
          : ["Dr. John Smith", "Prof. Sarah Wilson"],
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
      moduleLeader: userInfo.name,
    },
  ])

  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([
    {
      id: "1",
      courseId: "4",
      name: "Database Fundamentals - Lecture 1.pdf",
      type: "application/pdf",
      size: 2048000,
      uploadDate: "2025-01-10",
      uploadedBy: userInfo.name,
      category: "lecture",
    },
    {
      id: "2",
      courseId: "4",
      name: "Course Syllabus.pdf",
      type: "application/pdf",
      size: 512000,
      uploadDate: "2025-01-08",
      uploadedBy: userInfo.name,
      category: "syllabus",
    },
    {
      id: "3",
      courseId: "1",
      name: "Programming Assignment 1.pdf",
      type: "application/pdf",
      size: 1024000,
      uploadDate: "2025-01-12",
      uploadedBy: "Dr. Alice Johnson",
      category: "assignment",
    },
  ])

  const [teacherProgress, setTeacherProgress] = useState<TeacherProgress[]>([
    {
      teacherName: "Prof. Sarah Wilson",
      teacherEmail: "sarah.wilson@university.edu",
      theoryProgress: 95,
      labProgress: 88,
      overallProgress: 92,
      lastUpdated: "2025-01-15",
      status: "complete",
    },
    {
      teacherName: "Dr. Mike Davis",
      teacherEmail: "mike.davis@university.edu",
      theoryProgress: 70,
      labProgress: 45,
      overallProgress: 58,
      lastUpdated: "2025-01-12",
      status: "incomplete",
    },
  ])

  // Filter courses based on user's department
  const departmentCourses = courses.filter((course) => course.department === userInfo.department)
  const myCourses = courses.filter(
    (course) => course.enrolledTeachers.includes(userInfo.name) || course.moduleLeader === userInfo.name,
  )
  const myModuleCourses = courses.filter((course) => course.moduleLeader === userInfo.name)

  // Filter requests for current user as module leader
  const incomingRequests = accessRequests.filter(
    (request) => courses.find((course) => course.id === request.courseId)?.moduleLeader === userInfo.name,
  )
  const myRequests = accessRequests.filter((request) => request.teacherEmail === userInfo.email)

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
      teacherName: userInfo.name,
      teacherEmail: userInfo.email,
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

  const handleRequestResponse = (requestId: string, status: "approved" | "rejected") => {
    setAccessRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status } : request)))

    if (status === "approved") {
      const request = accessRequests.find((r) => r.id === requestId)
      if (request) {
        setCourses((prev) =>
          prev.map((course) =>
            course.id === request.courseId
              ? { ...course, enrolledTeachers: [...course.enrolledTeachers, request.teacherName] }
              : course,
          ),
        )
      }
    }
  }

  const handleMaterialUpload = (files: FileList | null, category: string) => {
    if (!files || !selectedCourse) return

    Array.from(files).forEach((file) => {
      const newMaterial: CourseMaterial = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        courseId: selectedCourse.id,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString().split("T")[0],
        uploadedBy: userInfo.name,
        category: category as any,
        url: URL.createObjectURL(file),
      }
      setCourseMaterials((prev) => [...prev, newMaterial])
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <X className="w-4 h-4 text-red-600" />
      case "incomplete":
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case "complete":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Complete</Badge>
      case "incomplete":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Incomplete</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "syllabus":
        return <BookOpen className="w-4 h-4" />
      case "lecture":
        return <FileText className="w-4 h-4" />
      case "assignment":
        return <Upload className="w-4 h-4" />
      case "exam":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const handleViewCourseDetails = (courseId: string) => {
    setSelectedCourseId(courseId)
    setShowCourseDetails(true)
  }

  if (showCourseDetails) {
    return (
      <CourseDetailsPage courseId={selectedCourseId} userInfo={userInfo} onBack={() => setShowCourseDetails(false)} />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Course Management System
        </h1>
        <p className="text-gray-600">Manage courses, access requests, and materials for {userInfo.department}</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg">
          <TabsTrigger value="all-courses" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            All Courses
          </TabsTrigger>
          <TabsTrigger value="my-courses" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Courses
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Access Requests
          </TabsTrigger>
          {userInfo.role === "module_leader" && (
            <TabsTrigger value="module-leader" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Module Leader
            </TabsTrigger>
          )}
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Materials
          </TabsTrigger>
        </TabsList>

        {/* All Courses Tab */}
        <TabsContent value="all-courses" className="space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Department Courses - {userInfo.department}
              </CardTitle>
              <CardDescription className="text-gray-600">All courses available in your department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Course Code</TableHead>
                      <TableHead className="font-semibold">Course Title</TableHead>
                      <TableHead className="font-semibold">Credit Hours</TableHead>
                      <TableHead className="font-semibold">Module Leader</TableHead>
                      {/* <TableHead className="font-semibold">Enrolled Teachers</TableHead> */}
                      {/* <TableHead className="font-semibold">Progress</TableHead> */}
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departmentCourses.map((course) => (
                      <TableRow key={course.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.creditHours}</TableCell>
                        <TableCell>{course.moduleLeader}</TableCell>
                        {/* <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {course.enrolledTeachers.map((teacher, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {teacher}
                              </Badge>
                            ))}
                          </div>
                        </TableCell> */}
                        {/* <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={course.documentProgress} className="w-16" />
                            <span className="text-sm">{course.documentProgress}%</span>
                          </div>
                        </TableCell> */}
                        <TableCell>
                          <div className="flex gap-2">
                            {(course.enrolledTeachers.includes(userInfo.name) ||
                              course.moduleLeader === userInfo.name) && (
                              <Button
                                size="sm"
                                onClick={() => handleViewCourseDetails(course.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            )}
                            {!course.enrolledTeachers.includes(userInfo.name) &&
                              course.moduleLeader !== userInfo.name && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRequestAccess(course)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Request Access
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Courses Tab */}
        <TabsContent value="my-courses" className="space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-600" />
                My Enrolled Courses
              </CardTitle>
              <CardDescription className="text-gray-600">Courses you are teaching or leading</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Course Code</TableHead>
                      <TableHead className="font-semibold">Course Title</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      {/* <TableHead className="font-semibold">Progress</TableHead> */}
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myCourses.map((course) => (
                      <TableRow key={course.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>
                          {course.moduleLeader === userInfo.name ? (
                            <Badge className="bg-purple-100 text-purple-800">Module Leader</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">Teacher</Badge>
                          )}
                        </TableCell>
                        {/* <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={course.documentProgress} className="w-16" />
                            <span className="text-sm">{course.documentProgress}%</span>
                          </div>
                        </TableCell> */}
                        <TableCell>
                          {course.documentProgress >= 90 ? (
                            <Badge className="bg-green-100 text-green-800">Complete</Badge>
                          ) : course.documentProgress >= 50 ? (
                            <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Incomplete</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleViewCourseDetails(course.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incoming Requests (as Module Leader) */}
            {userInfo.role === "module_leader" && (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Incoming Requests
                  </CardTitle>
                  <CardDescription className="text-gray-600">Requests for courses you lead</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {incomingRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No incoming requests</p>
                  ) : (
                    incomingRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{request.courseName}</h4>
                            <p className="text-sm text-gray-600">{request.courseCode}</p>
                            <p className="text-sm text-gray-600">From: {request.teacherName}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-700">{request.message}</p>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRequestResponse(request.id, "approved")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestResponse(request.id, "rejected")}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* My Requests */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-600" />
                  My Requests
                </CardTitle>
                <CardDescription className="text-gray-600">Your access requests to other courses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No requests sent</p>
                ) : (
                  myRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{request.courseName}</h4>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Module Leader Tab */}
        {userInfo.role === "module_leader" && (
          <TabsContent value="module-leader" className="space-y-6">
            {myModuleCourses.length === 0 ? (
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Module Leadership</h3>
                  <p className="text-gray-600">You are not currently leading any courses as a module leader.</p>
                </CardContent>
              </Card>
            ) : (
              myModuleCourses.map((course) => (
                <Card key={course.id} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Settings className="w-6 h-6 text-purple-600" />
                      {course.code} - {course.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">Module Leader Dashboard</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Teacher Progress Tracking */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Teacher Document Progress</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold">Teacher</TableHead>
                              <TableHead className="font-semibold">Theory Progress</TableHead>
                              <TableHead className="font-semibold">Lab Progress</TableHead>
                              <TableHead className="font-semibold">Overall</TableHead>
                              <TableHead className="font-semibold">Last Updated</TableHead>
                              <TableHead className="font-semibold">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {teacherProgress.map((teacher, index) => (
                              <TableRow key={index} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{teacher.teacherName}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={teacher.theoryProgress} className="w-16" />
                                    <span className="text-sm">{teacher.theoryProgress}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={teacher.labProgress} className="w-16" />
                                    <span className="text-sm">{teacher.labProgress}%</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={teacher.overallProgress} className="w-16" />
                                    <span className="text-sm font-medium">{teacher.overallProgress}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">{teacher.lastUpdated}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(teacher.status)}
                                    {getStatusBadge(teacher.status)}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Upload Materials Button */}
                    <div className="flex justify-between">
                      <Button
                        onClick={() => handleViewCourseDetails(course.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Course Details
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedCourse(course)
                          setShowMaterialModal(true)
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Course Materials
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        )}

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-orange-600" />
                Course Materials
              </CardTitle>
              <CardDescription className="text-gray-600">All uploaded course materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Material</TableHead>
                      <TableHead className="font-semibold">Course</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Size</TableHead>
                      <TableHead className="font-semibold">Uploaded By</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseMaterials.map((material) => {
                      const course = courses.find((c) => c.id === material.courseId)
                      return (
                        <TableRow key={material.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(material.category)}
                              <span className="font-medium">{material.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {course?.code} - {course?.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {material.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{formatFileSize(material.size)}</TableCell>
                          <TableCell>{material.uploadedBy}</TableCell>
                          <TableCell className="text-sm text-gray-600">{material.uploadDate}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => window.open(material.url, "_blank")}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const link = document.createElement("a")
                                  link.href = material.url || ""
                                  link.download = material.name
                                  link.click()
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Access Request Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Request Course Access</DialogTitle>
            <DialogDescription className="text-gray-600">
              Send a request to join {selectedCourse?.code} - {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                Message to Module Leader
              </Label>
              <Textarea
                id="message"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Explain why you want to teach this course..."
                className="min-h-[100px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitAccessRequest}
              disabled={!requestMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Material Upload Modal */}
      <Dialog open={showMaterialModal} onOpenChange={setShowMaterialModal}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Upload Course Materials</DialogTitle>
            <DialogDescription className="text-gray-600">
              Upload materials for {selectedCourse?.code} - {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Material Category
              </Label>
              <Select>
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="syllabus">Syllabus</SelectItem>
                  <SelectItem value="lecture">Lecture Notes</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="exam">Exam Materials</SelectItem>
                  <SelectItem value="reference">Reference Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="files" className="text-sm font-medium text-gray-700">
                Select Files
              </Label>
              <Input
                id="files"
                type="file"
                multiple
                onChange={(e) => handleMaterialUpload(e.target.files, "lecture")}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaterialModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowMaterialModal(false)} className="bg-purple-600 hover:bg-purple-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
