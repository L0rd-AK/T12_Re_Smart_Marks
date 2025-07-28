"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, CheckCircle, Clock, AlertCircle, Eye, ExternalLink, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
interface FileSubmission {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  status: "pending" | "approved" | "rejected"
  url?: string
}

interface AssignmentRow {
  id: string
  title: string
  category: "theory" | "lab"
  submissions: {
    marginal?: FileSubmission
    average?: FileSubmission
    excellent?: FileSubmission
    attendance?: FileSubmission
    labReport?: FileSubmission
    labFirst?: FileSubmission
    project?: FileSubmission
    experiments?: FileSubmission
    projects?: FileSubmission
    document?: FileSubmission
  }
  completionPercentage: number
}

interface DocumentSubmissionTabProps {
  courseInfo: {
    department: string
    batch: string
    section: string
    course: string
    courseCode: string
  }
  teacherInfo: {
    name: string
    employeeId: string
    designation: string
    email: string
    mobile: string
  }
  userInfo: {
    name: string
    email: string
    role: string
    department: string
  }
}

export default function DocumentSubmissionTab({ courseInfo, teacherInfo, userInfo }: DocumentSubmissionTabProps) {
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false)
  const [assignments, setAssignments] = useState<AssignmentRow[]>([
    {
      id: "1",
      title: "Course Outline (.doc Format)",
      category: "theory",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "2",
      title: "Class Test (Marginal, Average, Excellent Script) with Question",
      category: "theory",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "3",
      title: "Attendance (Class, Midterm Exam, Final Exam) pdf File",
      category: "theory",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "4",
      title: "Assignment (Marginal, Average, Excellent Script)",
      category: "theory",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "5",
      title: "Assignment & Presentation Marks Sheet on Rubrics (pdf)",
      category: "theory",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "6",
      title: "Midterm Exam Script (Marginal, Average, Excellent Script)",
      category: "theory",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "7",
      title: "Final Exam (Marginal, Average, Excellent Script)",
      category: "theory",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "8",
      title: "Final Tabulation Sheet (pdf Format)",
      category: "theory",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "9",
      title: "Section Wise CO - PO Mapping File",
      category: "theory",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "10",
      title: "Course End Report duly signed by Section Teacher (pdf Format)",
      category: "theory",
      submissions: {},
      completionPercentage: 0,
    },
    // Lab assignments
    {
      id: "11",
      title: "Lab Report",
      category: "lab",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "12",
      title: "Lab Performance, Lab First, Project (pdf)",
      category: "lab",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "13",
      title: "Lab with Project (Marginal, Average, Excellent Report)",
      category: "lab",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "14",
      title: "List of Projects and Experiments & signature (pdf)",
      category: "lab",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "15",
      title: "Class Attendance pdf File",
      category: "lab",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "16",
      title: "Section Wise CO - PO Mapping File",
      category: "lab",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "17",
      title: "Final Tabulation Sheet (pdf Format)",
      category: "lab",
      submissions: {},
      completionPercentage: 0,
    },
    {
      id: "18",
      title: "Course End Report duly signed by Section Teacher (pdf Format)",
      category: "lab",
      submissions: {},
      completionPercentage: 0,
    },
  ])

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleGoogleDriveConnect = () => {
    setIsGoogleDriveConnected(true)
    // In a real app, this would integrate with Google Drive API
  }

  const handleFileUpload = (assignmentId: string, submissionType: string, files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const newSubmission: FileSubmission = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadDate: new Date().toLocaleDateString(),
      status: "pending",
      url: URL.createObjectURL(file),
    }

    setAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.id === assignmentId) {
          const updatedSubmissions = {
            ...assignment.submissions,
            [submissionType]: newSubmission,
          }

          // Calculate completion percentage
          const totalSlots = getRequiredSubmissionTypes(assignment.title, assignment.category).length
          const completedSlots = Object.keys(updatedSubmissions).length
          const completionPercentage = Math.round((completedSlots / totalSlots) * 100)

          return {
            ...assignment,
            submissions: updatedSubmissions,
            completionPercentage,
          }
        }
        return assignment
      }),
    )
  }

  const getRequiredSubmissionTypes = (title: string, category: string) => {
    if (category === "theory") {
      if (title.includes("Class Test") || title.includes("Assignment") || title.includes("Exam Script")) {
        return ["marginal", "average", "excellent"]
      }
      if (title.includes("Attendance")) {
        return ["attendance"]
      }
      return ["document"]
    } else {
      if (title.includes("Lab Performance")) {
        return ["labReport", "labFirst", "project"]
      }
      if (title.includes("Lab with Project")) {
        return ["marginal", "average", "excellent"]
      }
      return ["document"]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Complete</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    }
  }

  const renderFileUploadButton = (assignment: AssignmentRow, submissionType: string, label: string) => {
    const submission = assignment.submissions[submissionType as keyof typeof assignment.submissions]
    const inputRef = `${assignment.id}-${submissionType}`

    return (
      <div className="min-w-[120px]">
        <input
          ref={(el) => {
            fileInputRefs.current[inputRef] = el
          }}
          type="file"
          className="hidden"
          onChange={(e) => handleFileUpload(assignment.id, submissionType, e.target.files)}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />

        {submission ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(submission.status)}
              <span className="text-xs text-gray-600 truncate max-w-[80px]" title={submission.name}>
                {submission.name}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-transparent"
                onClick={() => window.open(submission.url, "_blank")}
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-transparent"
                onClick={() => fileInputRefs.current[inputRef]?.click()}
              >
                <Upload className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs w-full bg-transparent"
            onClick={() => fileInputRefs.current[inputRef]?.click()}
          >
            Choose File
          </Button>
        )}
      </div>
    )
  }

  const theoryAssignments = assignments.filter((a) => a.category === "theory")
  const labAssignments = assignments.filter((a) => a.category === "lab")

  const overallTheoryCompletion =
    theoryAssignments.length > 0
      ? Math.round(theoryAssignments.reduce((sum, a) => sum + a.completionPercentage, 0) / theoryAssignments.length)
      : 0

  const overallLabCompletion =
    labAssignments.length > 0
      ? Math.round(labAssignments.reduce((sum, a) => sum + a.completionPercentage, 0) / labAssignments.length)
      : 0

  const [isModuleLeaderView, setIsModuleLeaderView] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [teacherSubmissions, setTeacherSubmissions] = useState<{
    [teacherEmail: string]: {
      assignments: AssignmentRow[]
      lastUpdated: string
      overallProgress: number
    }
  }>({
    "john.smith@university.edu": {
      assignments: [
        {
          id: "1",
          title: "Course Outline (.doc Format)",
          category: "theory",
          submissions: {
            document: {
              id: "1",
              name: "Course_Outline_CSE301.doc",
              type: "application/msword",
              size: 1024000,
              uploadDate: "2025-01-15",
              status: "approved",
              url: "#",
            },
          },
          completionPercentage: 100,
        },
        // Add more sample data...
      ],
      lastUpdated: "2025-01-15",
      overallProgress: 78,
    },
    "sarah.wilson@university.edu": {
      assignments: [
        {
          id: "1",
          title: "Course Outline (.doc Format)",
          category: "theory",
          submissions: {
            document: {
              id: "1",
              name: "Course_Outline_CSE301.doc",
              type: "application/msword",
              size: 1024000,
              uploadDate: "2025-01-12",
              status: "pending",
              url: "#",
            },
          },
          completionPercentage: 100,
        },
        // Add more sample data...
      ],
      lastUpdated: "2025-01-12",
      overallProgress: 45,
    },
  })

  // Mock enrolled teachers for the current course
  const enrolledTeachers = [
    {
      name: "Dr. John Smith",
      email: "john.smith@university.edu",
      employeeId: "EMP001",
      designation: "Assistant Professor",
    },
    {
      name: "Prof. Sarah Wilson",
      email: "sarah.wilson@university.edu",
      employeeId: "EMP003",
      designation: "Lecturer",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">OBE File Submission System</h1>
        {userInfo.role === "module_leader" && (
          <div className="flex justify-center gap-4 mt-4 ">
            <Tabs defaultValue="my-submission" className="w-[350px] p-2  bg-white shadow-md rounded-lg">
              <TabsList className="flex justify-between p-4">
                <TabsTrigger value="my-submission" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white" onClick={() => setIsModuleLeaderView(false)}> My Submissions</TabsTrigger>
                <TabsTrigger value="track-teachers" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white" onClick={() => setIsModuleLeaderView(true)}> Track Teachers</TabsTrigger>
              </TabsList>
              {/* <button
              onClick={() => setIsModuleLeaderView(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              My Submissions
            </button>
            <button
              onClick={() => setIsModuleLeaderView(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Track Teachers
            </button> */}</Tabs>
          </div>
        )}
      </div>

      {/* Module Leader Tracking View */}
      {userInfo.role === "module_leader" && isModuleLeaderView && (
        <>
          {/* Teacher Selection */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Teacher Submission Tracking</h3>
                  <p className="text-sm text-gray-600">
                    Monitor document submission progress for {courseInfo.courseCode} - {courseInfo.course}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Label htmlFor="teacher-select" className="text-sm font-medium">
                    Select Teacher:
                  </Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Choose a teacher to track" />
                    </SelectTrigger>
                    <SelectContent>
                      {enrolledTeachers.map((teacher) => (
                        <SelectItem key={teacher.email} value={teacher.email}>
                          {teacher.name} ({teacher.designation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledTeachers.map((teacher) => {
              const submissions = teacherSubmissions[teacher.email]
              return (
                <Card
                  key={teacher.email}
                  className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => setSelectedTeacher(teacher.email)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold">{teacher.name}</CardTitle>
                        <CardDescription className="text-sm">{teacher.designation}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{submissions?.overallProgress || 0}%</div>
                        <div className="text-xs text-gray-500">Complete</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Progress value={submissions?.overallProgress || 0} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{submissions?.lastUpdated || "Never"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <Badge
                          className={
                            (submissions?.overallProgress || 0) >= 90
                              ? "bg-green-100 text-green-800"
                              : (submissions?.overallProgress || 0) >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {(submissions?.overallProgress || 0) >= 90
                            ? "Complete"
                            : (submissions?.overallProgress || 0) >= 50
                              ? "In Progress"
                              : "Incomplete"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Selected Teacher Detailed View */}
          {selectedTeacher && teacherSubmissions[selectedTeacher] && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-t-lg">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Detailed Submission Status - {enrolledTeachers.find((t) => t.email === selectedTeacher)?.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Complete document submission tracking for {courseInfo.courseCode}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Theory Documents Table */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-orange-700">Theory Documents</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-orange-50">
                          <TableHead className="font-semibold">Document</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Upload Date</TableHead>
                          <TableHead className="font-semibold">File Name</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teacherSubmissions[selectedTeacher].assignments
                          .filter((a) => a.category === "theory")
                          .map((assignment) => (
                            <TableRow key={assignment.id} className="hover:bg-orange-25">
                              <TableCell className="font-medium">{assignment.title}</TableCell>
                              <TableCell>
                                {Object.keys(assignment.submissions).length > 0 ? (
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon("approved")}
                                    <Badge className="bg-green-100 text-green-800">Submitted</Badge>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon("pending")}
                                    <Badge className="bg-red-100 text-red-800">Missing</Badge>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {Object.values(assignment.submissions)[0]?.uploadDate || "Not uploaded"}
                              </TableCell>
                              <TableCell>{Object.values(assignment.submissions)[0]?.name || "No file"}</TableCell>
                              <TableCell>
                                {Object.keys(assignment.submissions).length > 0 && (
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="h-8 px-3 bg-transparent">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 px-3 bg-transparent">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Lab Documents Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">Lab Documents</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-50">
                          <TableHead className="font-semibold">Document</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Upload Date</TableHead>
                          <TableHead className="font-semibold">File Name</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teacherSubmissions[selectedTeacher].assignments
                          .filter((a) => a.category === "lab")
                          .map((assignment) => (
                            <TableRow key={assignment.id} className="hover:bg-blue-25">
                              <TableCell className="font-medium">{assignment.title}</TableCell>
                              <TableCell>
                                {Object.keys(assignment.submissions).length > 0 ? (
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon("approved")}
                                    <Badge className="bg-green-100 text-green-800">Submitted</Badge>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon("pending")}
                                    <Badge className="bg-red-100 text-red-800">Missing</Badge>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {Object.values(assignment.submissions)[0]?.uploadDate || "Not uploaded"}
                              </TableCell>
                              <TableCell>{Object.values(assignment.submissions)[0]?.name || "No file"}</TableCell>
                              <TableCell>
                                {Object.keys(assignment.submissions).length > 0 && (
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="h-8 px-3 bg-transparent">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 px-3 bg-transparent">
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Regular Teacher View (existing content) */}
      {(!isModuleLeaderView || userInfo.role !== "module_leader") && (
        <>
          {/* Google Drive Integration */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Connect to Google Drive</h3>
                    <p className="text-sm text-gray-600">Automatically organize your OBE files in structured folders</p>
                    <p className="text-xs text-gray-500">
                      Will create Theory folder & Lab folder in your Google directory
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleGoogleDriveConnect}
                  disabled={isGoogleDriveConnected}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGoogleDriveConnected ? "Connected" : "Connect Google Drive"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Course Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Teacher Information */}
            <Card className="shadow-lg border-0 bg-orange-50">
              <CardHeader className="bg-orange-200 rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-gray-900">Course Teacher Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Course Teacher Name with Initial:</span> {teacherInfo.name}
                  </div>
                  <div>
                    <span className="font-medium">Employee ID:</span> {teacherInfo.employeeId}
                  </div>
                  <div>
                    <span className="font-medium">Designation:</span> {teacherInfo.designation}
                  </div>
                  <div>
                    <span className="font-medium">Email ID:</span> {teacherInfo.email}
                  </div>
                  <div>
                    <span className="font-medium">Mobile Number:</span> {teacherInfo.mobile}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Information */}
            <Card className="shadow-lg border-0 bg-blue-50">
              <CardHeader className="bg-blue-200 rounded-t-lg">
                <CardTitle className="text-lg font-semibold text-gray-900">Course Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Semester:</span> Spring 2025
                  </div>
                  <div>
                    <span className="font-medium">Course Code:</span> {courseInfo.courseCode}
                  </div>
                  <div>
                    <span className="font-medium">Course Title:</span> {courseInfo.course}
                  </div>
                  <div>
                    <span className="font-medium">Credit Hours:</span> 3
                  </div>
                  <div>
                    <span className="font-medium">Course Section:</span> {courseInfo.section}
                  </div>
                  <div>
                    <span className="font-medium">Number of Class Conducted:</span> 32
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Theory Checklist */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-orange-100 rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  OBE File Submission Checklist (Theory)
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Overall Progress:</span>
                  <Progress value={overallTheoryCompletion} className="w-24" />
                  <span className="text-sm font-medium">{overallTheoryCompletion}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-50">
                      <TableHead className="font-semibold text-gray-900 min-w-[300px]">
                        Check List (Upload in Section Wise OBE Drive)
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[120px]">
                        Marginal Script
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[120px]">
                        Average Script
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[120px]">
                        Excellent Script
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[120px]">Document</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[100px]">Submitted</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[120px]">
                        Completion
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {theoryAssignments.map((assignment) => (
                      <TableRow key={assignment.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium p-4">{assignment.title}</TableCell>

                        {/* Marginal Script Column */}
                        <TableCell className="p-2 text-center">
                          {assignment.title.includes("Class Test") ||
                            assignment.title.includes("Assignment") ||
                            assignment.title.includes("Exam Script") ? (
                            renderFileUploadButton(assignment, "marginal", "Marginal Script")
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>

                        {/* Average Script Column */}
                        <TableCell className="p-2 text-center">
                          {assignment.title.includes("Class Test") ||
                            assignment.title.includes("Assignment") ||
                            assignment.title.includes("Exam Script") ? (
                            renderFileUploadButton(assignment, "average", "Average Script")
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>

                        {/* Excellent Script Column */}
                        <TableCell className="p-2 text-center">
                          {assignment.title.includes("Class Test") ||
                            assignment.title.includes("Assignment") ||
                            assignment.title.includes("Exam Script") ? (
                            renderFileUploadButton(assignment, "excellent", "Excellent Script")
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>

                        {/* Document Column */}
                        <TableCell className="p-2 text-center">
                          {!(
                            assignment.title.includes("Class Test") ||
                            assignment.title.includes("Assignment") ||
                            assignment.title.includes("Exam Script")
                          ) ? (
                            renderFileUploadButton(assignment, "document", "Document")
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>

                        {/* Submitted Column */}
                        <TableCell className="text-center">
                          {Object.keys(assignment.submissions).length > 0 ? (
                            <Badge className="bg-green-100 text-green-800">Yes</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">No</Badge>
                          )}
                        </TableCell>

                        {/* Completion Column */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={assignment.completionPercentage} className="w-16" />
                            <span className="text-sm font-medium">{assignment.completionPercentage}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Lab Checklist */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-blue-100 rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  OBE File Submission Checklist (Lab)
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Overall Progress:</span>
                  <Progress value={overallLabCompletion} className="w-24" />
                  <span className="text-sm font-medium">{overallLabCompletion}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="font-semibold text-gray-900 min-w-[300px]">
                        Check List (Upload in Section Wise OBE Drive)
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[120px]">
                        Lab Report
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[120px]">Lab First</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[120px]">Project</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[120px]">Document</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[100px]">Submitted</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center min-w-[120px]">
                        Completion
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {labAssignments.map((assignment) => (
                      <TableRow key={assignment.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium p-4">{assignment.title}</TableCell>

                        {/* Lab Report Column */}
                        <TableCell className="p-2 text-center">
                          {assignment.title.includes("Lab Performance") ? (
                            renderFileUploadButton(assignment, "labReport", "Lab Report")
                          ) : assignment.title.includes("Lab with Project") ? (
                            renderFileUploadButton(assignment, "marginal", "Marginal Script")
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>

                        {/* Lab First Column */}
                        <TableCell className="p-2 text-center">
                          {assignment.title.includes("Lab Performance") ? (
                            renderFileUploadButton(assignment, "labFirst", "Lab First")
                          ) : assignment.title.includes("Lab with Project") ? (
                            renderFileUploadButton(assignment, "average", "Average Script")
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>

                        {/* Project Column */}
                        <TableCell className="p-2 text-center">
                          {assignment.title.includes("Lab Performance") ? (
                            renderFileUploadButton(assignment, "project", "Project")
                          ) : assignment.title.includes("Lab with Project") ? (
                            renderFileUploadButton(assignment, "excellent", "Excellent Script")
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>

                        {/* Document Column */}
                        <TableCell className="p-2 text-center">
                          {!(
                            assignment.title.includes("Lab Performance") ||
                            assignment.title.includes("Lab with Project")
                          ) ? (
                            renderFileUploadButton(assignment, "document", "Document")
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </TableCell>

                        {/* Submitted Column */}
                        <TableCell className="text-center">
                          {Object.keys(assignment.submissions).length > 0 ? (
                            <Badge className="bg-green-100 text-green-800">Yes</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">No</Badge>
                          )}
                        </TableCell>

                        {/* Completion Column */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={assignment.completionPercentage} className="w-16" />
                            <span className="text-sm font-medium">{assignment.completionPercentage}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
