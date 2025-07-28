"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  BookOpen,
  Users,
  FileText,
  Calendar,
  Clock,
  Download,
  Eye,
  Upload,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  GraduationCap,
  Target,
  Award,
  BarChart3,
  ExternalLink,
} from "lucide-react"

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
  description: string
  prerequisites: string[]
  learningOutcomes: string[]
  assessmentBreakdown: {
    assignment: number
    presentation: number
    quiz: number
    midterm: number
    final: number
  }
  schedule: {
    theory: string
    lab: string
  }
  totalClasses: number
  conductedClasses: number
  startDate: string
  endDate: string
  // Add these new properties
  blcLink: string
  enrollmentKey: string
  courseOutcomeFile?: {
    name: string
    url: string
    uploadDate: string
  }
  assignmentTemplate?: {
    name: string
    url: string
    uploadDate: string
  }
  presentationTemplate?: {
    name: string
    url: string
    uploadDate: string
  }
}

interface CourseMaterial {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  uploadedBy: string
  category: "syllabus" | "lecture" | "assignment" | "exam" | "reference"
  url?: string
}

interface Teacher {
  name: string
  email: string
  employeeId: string
  designation: string
  mobile: string
  department: string
  specialization: string
  experience: number
}

interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
  priority: "low" | "medium" | "high"
}

interface CourseDetailsPageProps {
  courseId: string
  userInfo: {
    name: string
    email: string
    role: string
    department: string
  }
  onBack: () => void
}

export default function CourseDetailsPage({ courseId, userInfo, onBack }: CourseDetailsPageProps) {
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null)

  // Mock course data - in real app this would come from API
  const course: Course = {
    id: courseId,
    code: "CSE301",
    title: "Database Management Systems",
    department: "Computer Science",
    semester: "Spring 2025",
    creditHours: 3,
    moduleLeader: "Dr. Carol White",
    moduleLeaderEmail: "carol.white@university.edu",
    enrolledTeachers: ["Dr. John Smith", "Prof. Sarah Wilson", "Dr. Mike Davis"],
    status: "active",
    documentProgress: 92,
    description:
      "This course provides a comprehensive introduction to database management systems, covering database design, SQL, normalization, transactions, and modern database technologies including NoSQL databases.",
    prerequisites: ["CSE201 - Data Structures", "CSE202 - Object Oriented Programming"],
    learningOutcomes: [
      "Design and implement relational database schemas",
      "Write complex SQL queries for data manipulation and retrieval",
      "Understand database normalization and optimization techniques",
      "Implement database transactions and concurrency control",
      "Evaluate and select appropriate database technologies for different applications",
    ],
    assessmentBreakdown: {
      assignment: 5,
      presentation: 8,
      quiz: 15,
      midterm: 25,
      final: 40,
    },
    schedule: {
      theory: "Mon, Wed, Fri - 10:00 AM to 11:00 AM",
      lab: "Tuesday - 2:00 PM to 5:00 PM",
    },
    totalClasses: 45,
    conductedClasses: 32,
    startDate: "2025-01-15",
    endDate: "2025-05-15",
    // Add the new fields
    blcLink: "https://blc.university.edu/course/cse301-dbms-spring2025",
    enrollmentKey: "DBMS2025#CSE301",
    courseOutcomeFile: {
      name: "CSE301_Course_Outcomes_Mapping.pdf",
      url: "#",
      uploadDate: "2025-01-10",
    },
    assignmentTemplate: {
      name: "CSE301_Assignment_Template.docx",
      url: "#",
      uploadDate: "2025-01-10",
    },
    presentationTemplate: {
      name: "CSE301_Presentation_Template.pptx",
      url: "#",
      uploadDate: "2025-01-10",
    },
  }

  const courseMaterials: CourseMaterial[] = [
    {
      id: "1",
      name: "Course Syllabus - Database Management Systems.pdf",
      type: "application/pdf",
      size: 512000,
      uploadDate: "2025-01-15",
      uploadedBy: "Dr. Carol White",
      category: "syllabus",
      url: "#",
    },
    {
      id: "2",
      name: "Chapter 1 - Introduction to Databases.pdf",
      type: "application/pdf",
      size: 2048000,
      uploadDate: "2025-01-18",
      uploadedBy: "Dr. Carol White",
      category: "lecture",
      url: "#",
    },
    {
      id: "3",
      name: "Chapter 2 - Relational Model.pdf",
      type: "application/pdf",
      size: 1536000,
      uploadDate: "2025-01-22",
      uploadedBy: "Dr. Carol White",
      category: "lecture",
      url: "#",
    },
    {
      id: "4",
      name: "Assignment 1 - ER Diagram Design.pdf",
      type: "application/pdf",
      size: 768000,
      uploadDate: "2025-01-25",
      uploadedBy: "Dr. John Smith",
      category: "assignment",
      url: "#",
    },
    {
      id: "5",
      name: "Lab Manual - SQL Basics.pdf",
      type: "application/pdf",
      size: 1024000,
      uploadDate: "2025-01-20",
      uploadedBy: "Prof. Sarah Wilson",
      category: "reference",
      url: "#",
    },
    {
      id: "6",
      name: "Midterm Exam Sample Questions.pdf",
      type: "application/pdf",
      size: 384000,
      uploadDate: "2025-02-10",
      uploadedBy: "Dr. Carol White",
      category: "exam",
      url: "#",
    },
  ]

  const teachers: Teacher[] = [
    {
      name: "Dr. Carol White",
      email: "carol.white@university.edu",
      employeeId: "EMP005",
      designation: "Associate Professor",
      mobile: "+1234567894",
      department: "Computer Science",
      specialization: "Database Systems, Data Mining",
      experience: 12,
    },
    {
      name: "Dr. John Smith",
      email: "john.smith@university.edu",
      employeeId: "EMP001",
      designation: "Assistant Professor",
      mobile: "+1234567890",
      department: "Computer Science",
      specialization: "Software Engineering, Web Development",
      experience: 8,
    },
    {
      name: "Prof. Sarah Wilson",
      email: "sarah.wilson@university.edu",
      employeeId: "EMP003",
      designation: "Lecturer",
      mobile: "+1234567892",
      department: "Computer Science",
      specialization: "Database Administration, System Analysis",
      experience: 6,
    },
    {
      name: "Dr. Mike Davis",
      email: "mike.davis@university.edu",
      employeeId: "EMP006",
      designation: "Assistant Professor",
      mobile: "+1234567895",
      department: "Computer Science",
      specialization: "Data Science, Machine Learning",
      experience: 5,
    },
  ]

  const announcements: Announcement[] = [
    {
      id: "1",
      title: "Midterm Exam Schedule",
      content:
        "The midterm examination for Database Management Systems will be held on March 15, 2025, from 10:00 AM to 12:00 PM in Room 301. Please bring your student ID and writing materials.",
      date: "2025-02-20",
      author: "Dr. Carol White",
      priority: "high",
    },
    {
      id: "2",
      title: "Assignment 2 Deadline Extended",
      content:
        "Due to technical issues with the lab equipment, the deadline for Assignment 2 (Database Normalization) has been extended to February 28, 2025.",
      date: "2025-02-18",
      author: "Dr. John Smith",
      priority: "medium",
    },
    {
      id: "3",
      title: "Guest Lecture on NoSQL Databases",
      content:
        "We are pleased to announce a guest lecture by Dr. Emily Johnson from Tech Corp on 'Modern NoSQL Database Technologies' on March 5, 2025, at 2:00 PM in the main auditorium.",
      date: "2025-02-15",
      author: "Dr. Carol White",
      priority: "low",
    },
    {
      id: "4",
      title: "Lab Session Rescheduled",
      content:
        "The lab session scheduled for February 25, 2025, has been rescheduled to February 26, 2025, at the same time due to a faculty meeting.",
      date: "2025-02-22",
      author: "Prof. Sarah Wilson",
      priority: "medium",
    },
  ]

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "syllabus":
        return <BookOpen className="w-4 h-4 text-blue-600" />
      case "lecture":
        return <FileText className="w-4 h-4 text-green-600" />
      case "assignment":
        return <Upload className="w-4 h-4 text-orange-600" />
      case "exam":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "reference":
        return <BookOpen className="w-4 h-4 text-purple-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      syllabus: "bg-blue-100 text-blue-800 border-blue-200",
      lecture: "bg-green-100 text-green-800 border-green-200",
      assignment: "bg-orange-100 text-orange-800 border-orange-200",
      exam: "bg-red-100 text-red-800 border-red-200",
      reference: "bg-purple-100 text-purple-800 border-purple-200",
    }
    return <Badge className={`${colors[category as keyof typeof colors]} capitalize`}>{category}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    }
    return <Badge className={`${colors[priority as keyof typeof colors]} capitalize`}>{priority}</Badge>
  }

  const classProgress = Math.round((course.conductedClasses / course.totalClasses) * 100)

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {course.code} - {course.title}
          </h1>
          <p className="text-gray-600 mt-1">
            {course.department} • {course.semester}
          </p>
        </div>
      </div>

      {/* Course Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Credit Hours</p>
                <p className="text-3xl font-bold text-blue-900">{course.creditHours}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Enrolled Teachers</p>
                <p className="text-3xl font-bold text-green-900">{course.enrolledTeachers.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Class Progress</p>
                <p className="text-3xl font-bold text-orange-900">{classProgress}%</p>
                <p className="text-xs text-orange-600">
                  {course.conductedClasses}/{course.totalClasses} classes
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Document Progress</p>
                <p className="text-3xl font-bold text-purple-900">{course.documentProgress}%</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Assessment
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Announcements
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* BLC Link and Enrollment Key */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ExternalLink className="w-6 h-6 text-blue-600" />
                Blended Learning Center (BLC)
              </CardTitle>
              <CardDescription className="text-gray-600">Access online course materials and activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-blue-200">
                  <Label className="text-sm font-medium text-blue-700 mb-2 block">BLC Course Link</Label>
                  <div className="flex items-center gap-2">
                    <Input value={course.blcLink} readOnly className="text-sm bg-blue-50 border-blue-200" />
                    <Button
                      size="sm"
                      onClick={() => window.open(course.blcLink, "_blank")}
                      className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <Label className="text-sm font-medium text-green-700 mb-2 block">Enrollment Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={course.enrollmentKey}
                      readOnly
                      className="text-sm bg-green-50 border-green-200 font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(course.enrollmentKey)
                        // You could add a toast notification here
                      }}
                      className="border-green-200 text-green-600 hover:bg-green-50 flex-shrink-0"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <AlertCircle className="w-4 h-4 inline mr-2 text-yellow-600" />
                <strong>Note:</strong> Use the enrollment key to join the BLC course. Share this key only with enrolled
                students.
              </div>
            </CardContent>
          </Card>

          {/* Course Templates and Files */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-600" />
                Course Templates & Files
              </CardTitle>
              <CardDescription className="text-gray-600">Download course templates and outcome files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Course Outcome File */}
                {course.courseOutcomeFile && (
                  <div className="p-4 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Course Outcomes</h4>
                        <p className="text-xs text-gray-500">CO-PO Mapping</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{course.courseOutcomeFile.name}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(course.courseOutcomeFile?.url, "_blank")}
                        className="bg-purple-600 hover:bg-purple-700 flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = course.courseOutcomeFile?.url || ""
                          link.download = course.courseOutcomeFile?.name || ""
                          link.click()
                        }}
                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Uploaded: {course.courseOutcomeFile.uploadDate}</p>
                  </div>
                )}

                {/* Assignment Template */}
                {course.assignmentTemplate && (
                  <div className="p-4 bg-white rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Assignment Template</h4>
                        <p className="text-xs text-gray-500">Standard Format</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{course.assignmentTemplate.name}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(course.assignmentTemplate?.url, "_blank")}
                        className="bg-orange-600 hover:bg-orange-700 flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = course.assignmentTemplate?.url || ""
                          link.download = course.assignmentTemplate?.name || ""
                          link.click()
                        }}
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Uploaded: {course.assignmentTemplate.uploadDate}</p>
                  </div>
                )}

                {/* Presentation Template */}
                {course.presentationTemplate && (
                  <div className="p-4 bg-white rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Presentation Template</h4>
                        <p className="text-xs text-gray-500">Standard Format</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{course.presentationTemplate.name}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(course.presentationTemplate?.url, "_blank")}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = course.presentationTemplate?.url || ""
                          link.download = course.presentationTemplate?.name || ""
                          link.click()
                        }}
                        className="border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Uploaded: {course.presentationTemplate.uploadDate}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Description */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Course Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-6 h-6 text-orange-600" />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {prereq}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Outcomes */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-600" />
                Learning Outcomes
              </CardTitle>
              <CardDescription>Upon completion of this course, students will be able to:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{outcome}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Course Materials
              </CardTitle>
              <CardDescription>All uploaded course materials and resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Material</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Size</TableHead>
                      <TableHead className="font-semibold">Uploaded By</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseMaterials.map((material) => (
                      <TableRow key={material.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(material.category)}
                            <span className="font-medium">{material.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(material.category)}</TableCell>
                        <TableCell className="text-sm text-gray-600">{formatFileSize(material.size)}</TableCell>
                        <TableCell>{material.uploadedBy}</TableCell>
                        <TableCell className="text-sm text-gray-600">{material.uploadDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMaterial(material)
                                setShowMaterialModal(true)
                              }}
                              className="h-8 px-3"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(material.url, "_blank")}
                              className="h-8 px-3"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
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

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teachers.map((teacher) => (
              <Card key={teacher.email} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500">
                      <AvatarFallback className="text-white font-semibold text-lg">
                        {teacher.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-semibold">{teacher.name}</CardTitle>
                      <CardDescription className="text-sm">{teacher.designation}</CardDescription>
                      {teacher.email === course.moduleLeaderEmail && (
                        <Badge className="bg-purple-100 text-purple-800 mt-1">Module Leader</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Employee ID:</span> {teacher.employeeId}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Email:</span> {teacher.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Mobile:</span> {teacher.mobile}
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Specialization:</span> {teacher.specialization}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Experience:</span> {teacher.experience} years
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Schedule */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Class Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Theory Classes</h4>
                  <p className="text-blue-700">{course.schedule.theory}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Lab Sessions</h4>
                  <p className="text-green-700">{course.schedule.lab}</p>
                </div>
              </CardContent>
            </Card>

            {/* Course Timeline */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  Course Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Start Date:</span>
                  <Badge variant="outline">{course.startDate}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">End Date:</span>
                  <Badge variant="outline">{course.endDate}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Class Progress:</span>
                    <span className="text-sm">
                      {course.conductedClasses}/{course.totalClasses}
                    </span>
                  </div>
                  <Progress value={classProgress} className="h-2" />
                  <p className="text-sm text-gray-600">{classProgress}% completed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                Assessment Breakdown
              </CardTitle>
              <CardDescription>Distribution of marks across different assessment types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(course.assessmentBreakdown).map(([type, marks]) => (
                  <Card key={type} className="border-2 border-gray-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{marks}%</div>
                      <div className="text-sm font-medium text-gray-600 capitalize">{type}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Assessment Details Table */}
              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Assessment Type</TableHead>
                      <TableHead className="font-semibold">Weightage</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Assignment</TableCell>
                      <TableCell>{course.assessmentBreakdown.assignment}%</TableCell>
                      <TableCell>Individual assignments and projects</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Presentation</TableCell>
                      <TableCell>{course.assessmentBreakdown.presentation}%</TableCell>
                      <TableCell>Oral presentations and demonstrations</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Quiz</TableCell>
                      <TableCell>{course.assessmentBreakdown.quiz}%</TableCell>
                      <TableCell>Regular quizzes and class tests</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Midterm</TableCell>
                      <TableCell>{course.assessmentBreakdown.midterm}%</TableCell>
                      <TableCell>Mid-semester examination</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Final</TableCell>
                      <TableCell>{course.assessmentBreakdown.final}%</TableCell>
                      <TableCell>Final semester examination</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                Course Announcements
              </CardTitle>
              <CardDescription>Latest updates and announcements for this course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(announcement.priority)}
                          <span className="text-sm text-gray-500">{announcement.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{announcement.content}</p>
                      <p className="text-sm text-gray-500">Posted by: {announcement.author}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Material Preview Modal */}
      <Dialog open={showMaterialModal} onOpenChange={setShowMaterialModal}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Material Preview</DialogTitle>
            <DialogDescription className="text-gray-600">{selectedMaterial?.name}</DialogDescription>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {getCategoryIcon(selectedMaterial.category)}
                <div>
                  <p className="font-medium">{selectedMaterial.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(selectedMaterial.size)} • Uploaded by {selectedMaterial.uploadedBy}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => window.open(selectedMaterial.url, "_blank")} className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = selectedMaterial.url || ""
                    link.download = selectedMaterial.name
                    link.click()
                  }}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
