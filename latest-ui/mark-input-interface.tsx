"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LogOut, Settings, BookOpen, Users, BarChart3, Award, FileText, GraduationCap } from "lucide-react"
import { useAuth } from "./components/auth-provider"
import DocumentSubmissionTab from "./components/document-submission-tab"
import CoursesPage from "./components/courses-page"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
type AssessmentType = "assignment" | "presentation" | "quiz" | "midterm" | "final"

interface StudentMark {
  studentId: string
  marks: { [key: string]: number }
  total: number
}

interface QuizData {
  studentId: string
  quiz1: number
  quiz2: number
  quiz3: number
  average: number
}

export default function MarkInputInterface() {
  const { user, logout } = useAuth()
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | "">("")
  const [currentStudentId, setCurrentStudentId] = useState("")
  const [currentInput, setCurrentInput] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [questionFormat, setQuestionFormat] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [selectedQuiz, setSelectedQuiz] = useState<1 | 2 | 3 | null>(null)

  // Data storage
  const [assignmentData, setAssignmentData] = useState<StudentMark[]>([])
  const [presentationData, setPresentationData] = useState<StudentMark[]>([])
  const [quizData, setQuizData] = useState<QuizData[]>([])
  const [midtermData, setMidtermData] = useState<StudentMark[]>([])
  const [finalData, setFinalData] = useState<StudentMark[]>([])

  // Temporary storage for current student
  const [tempMarks, setTempMarks] = useState<{ [key: string]: number }>({})

  const [showCourseModal, setShowCourseModal] = useState(true)
  const [courseInfo, setCourseInfo] = useState({
    department: "",
    batch: "",
    section: "",
    course: "",
    courseCode: "",
  })
  const [tempCourseInfo, setTempCourseInfo] = useState({
    department: "",
    batch: "",
    section: "",
    course: "",
    courseCode: "",
  })

  // Mock teacher info - in real app this would come from auth/API
  const teacherInfo = {
    name: user?.name || "Dr. John Smith",
    employeeId: user?.employeeId || "EMP001",
    designation: user?.designation || "Assistant Professor",
    email: user?.email || "john.smith@university.edu",
    mobile: user?.mobile || "+1234567890",
  }

  const userInfo = {
    name: user?.name || "Dr. John Smith",
    email: user?.email || "john.smith@university.edu",
    role: user?.role || "teacher",
    department: user?.department || courseInfo.department || "Computer Science",
  }

  const assessmentTypes = [
    { value: "assignment", label: "Assignment", total: 5, icon: BookOpen, color: "from-blue-500 to-cyan-500" },
    { value: "presentation", label: "Presentation", total: 8, icon: Users, color: "from-green-500 to-emerald-500" },
    { value: "quiz", label: "Quiz", total: 15, icon: BarChart3, color: "from-yellow-500 to-orange-500" },
    { value: "midterm", label: "Midterm", total: 25, icon: Award, color: "from-purple-500 to-violet-500" },
    { value: "final", label: "Final", total: 40, icon: Award, color: "from-red-500 to-pink-500" },
  ]

  const assignmentCriteria = [
    { key: "relevantKnowledge", label: "Relevant Knowledge", max: 1 },
    { key: "problemStatement", label: "Defining Problem Statement", max: 1 },
    { key: "methodology", label: "Use of appropriate method/formula", max: 2 },
    { key: "findings", label: "Findings/Solution", max: 1 },
  ]

  const presentationCriteria = [
    { key: "getup", label: "Getup and Outfit", max: 0.8 },
    { key: "bodyLanguage", label: "Body Language", max: 0.8 },
    { key: "communication", label: "English Communication", max: 0.8 },
    { key: "eyeContact", label: "Eye Contact", max: 0.8 },
    { key: "knowledge", label: "Knowledge/Content", max: 3.2 },
    { key: "qa", label: "Handling Q&A", max: 1.6 },
  ]

  const resetCurrentState = () => {
    setCurrentStudentId("")
    setCurrentInput("")
    setCurrentStep(0)
    setCurrentQuestion("")
    setTempMarks({})
  }

  const handleAssessmentChange = (value: string) => {
    setSelectedAssessment(value as AssessmentType)
    resetCurrentState()
    setQuestionFormat("")
    setSelectedQuiz(null)
  }

  const handleInputSubmit = () => {
    const inputValue = currentInput.trim()

    if (!inputValue) return

    if (selectedAssessment === "midterm" || selectedAssessment === "final") {
      handleExamInput(inputValue)
    } else if (selectedAssessment === "assignment") {
      handleAssignmentInput(inputValue)
    } else if (selectedAssessment === "presentation") {
      handlePresentationInput(inputValue)
    } else if (selectedAssessment === "quiz") {
      handleQuizInput(inputValue)
    }

    setCurrentInput("")
  }

  const handleExamInput = (input: string) => {
    if (!questionFormat) {
      setQuestionFormat(input)
      return
    }

    if (input === "0") {
      if (currentStudentId && Object.keys(tempMarks).length > 0) {
        const total = Object.values(tempMarks).reduce((sum, mark) => sum + mark, 0)
        const studentData = {
          studentId: currentStudentId,
          marks: { ...tempMarks },
          total,
        }

        if (selectedAssessment === "midterm") {
          setMidtermData((prev) => [...prev.filter((s) => s.studentId !== currentStudentId), studentData])
        } else {
          setFinalData((prev) => [...prev.filter((s) => s.studentId !== currentStudentId), studentData])
        }
      }
      resetCurrentState()
      return
    }

    if (input === "-1") {
      setCurrentQuestion("")
      setCurrentStep(1)
      return
    }

    if (currentStep === 0) {
      setCurrentStudentId(input)
      setCurrentStep(1)
    } else if (currentStep === 1) {
      setCurrentQuestion(input)
      setCurrentStep(2)
    } else if (currentStep === 2) {
      const mark = Number.parseFloat(input)
      if (!isNaN(mark)) {
        setTempMarks((prev) => ({ ...prev, [currentQuestion]: mark }))
        setCurrentStep(1)
        setCurrentQuestion("")
      }
    }
  }

  const handleAssignmentInput = (input: string) => {
    if (input === "0") {
      if (currentStudentId && Object.keys(tempMarks).length === 4) {
        const total = Object.values(tempMarks).reduce((sum, mark) => sum + mark, 0)
        const studentData = {
          studentId: currentStudentId,
          marks: { ...tempMarks },
          total,
        }
        setAssignmentData((prev) => [...prev.filter((s) => s.studentId !== currentStudentId), studentData])
      }
      resetCurrentState()
      return
    }

    if (currentStep === 0) {
      setCurrentStudentId(input)
      setCurrentStep(1)
    } else if (currentStep <= assignmentCriteria.length) {
      const mark = Number.parseFloat(input)
      if (!isNaN(mark)) {
        const criterion = assignmentCriteria[currentStep - 1]
        setTempMarks((prev) => ({ ...prev, [criterion.key]: mark }))
        setCurrentStep((prev) => prev + 1)
      }
    }
  }

  const handlePresentationInput = (input: string) => {
    if (input === "0") {
      if (currentStudentId && Object.keys(tempMarks).length === 6) {
        const total = Object.values(tempMarks).reduce((sum, mark) => sum + mark, 0)
        const studentData = {
          studentId: currentStudentId,
          marks: { ...tempMarks },
          total,
        }
        setPresentationData((prev) => [...prev.filter((s) => s.studentId !== currentStudentId), studentData])
      }
      resetCurrentState()
      return
    }

    if (currentStep === 0) {
      setCurrentStudentId(input)
      setCurrentStep(1)
    } else if (currentStep <= presentationCriteria.length) {
      const mark = Number.parseFloat(input)
      if (!isNaN(mark)) {
        const criterion = presentationCriteria[currentStep - 1]
        setTempMarks((prev) => ({ ...prev, [criterion.key]: mark }))
        setCurrentStep((prev) => prev + 1)
      }
    }
  }

  const handleQuizInput = (input: string) => {
    if (input === "0") {
      if (currentStudentId && selectedQuiz) {
        const mark = Number.parseFloat(tempMarks.currentMark?.toString() || "0")
        if (!isNaN(mark)) {
          setQuizData((prev) => {
            const existing = prev.find((s) => s.studentId === currentStudentId)
            if (existing) {
              const updated = { ...existing, [`quiz${selectedQuiz}`]: mark }
              updated.average = (updated.quiz1 + updated.quiz2 + updated.quiz3) / 3
              return prev.map((s) => (s.studentId === currentStudentId ? updated : s))
            } else {
              const newData: QuizData = {
                studentId: currentStudentId,
                quiz1: selectedQuiz === 1 ? mark : 0,
                quiz2: selectedQuiz === 2 ? mark : 0,
                quiz3: selectedQuiz === 3 ? mark : 0,
                average: 0,
              }
              newData.average = (newData.quiz1 + newData.quiz2 + newData.quiz3) / 3
              return [...prev, newData]
            }
          })
        }
      }
      resetCurrentState()
      return
    }

    if (currentStep === 0) {
      setCurrentStudentId(input)
      setCurrentStep(1)
    } else if (currentStep === 1) {
      const mark = Number.parseFloat(input)
      if (!isNaN(mark)) {
        setTempMarks({ currentMark: mark })
        setCurrentStep(2)
      }
    }
  }

  const setFullMarks = (type: "assignment" | "presentation") => {
    if (!currentStudentId) return

    if (type === "assignment") {
      const fullMarks = assignmentCriteria.reduce(
        (acc, criterion) => {
          acc[criterion.key] = criterion.max
          return acc
        },
        {} as { [key: string]: number },
      )

      const total = Object.values(fullMarks).reduce((sum, mark) => sum + mark, 0)
      const studentData = {
        studentId: currentStudentId,
        marks: fullMarks,
        total,
      }
      setAssignmentData((prev) => [...prev.filter((s) => s.studentId !== currentStudentId), studentData])
    } else if (type === "presentation") {
      const fullMarks = presentationCriteria.reduce(
        (acc, criterion) => {
          acc[criterion.key] = criterion.max
          return acc
        },
        {} as { [key: string]: number },
      )

      const total = Object.values(fullMarks).reduce((sum, mark) => sum + mark, 0)
      const studentData = {
        studentId: currentStudentId,
        marks: fullMarks,
        total,
      }
      setPresentationData((prev) => [...prev.filter((s) => s.studentId !== currentStudentId), studentData])
    }
    resetCurrentState()
  }

  const getCurrentPrompt = () => {
    if (!selectedAssessment) return "Select an assessment type first"

    if (selectedAssessment === "midterm" || selectedAssessment === "final") {
      if (!questionFormat) return "Enter question format:"
      if (currentStep === 0) return "Enter Student ID:"
      if (currentStep === 1) return "Enter Question Number (or -1 to change question):"
      if (currentStep === 2) return `Enter marks for Question ${currentQuestion}:`
    }

    if (selectedAssessment === "assignment") {
      if (currentStep === 0) return "Enter Student ID:"
      if (currentStep <= assignmentCriteria.length) {
        const criterion = assignmentCriteria[currentStep - 1]
        return `Enter ${criterion.label} (max: ${criterion.max}):`
      }
    }

    if (selectedAssessment === "presentation") {
      if (currentStep === 0) return "Enter Student ID:"
      if (currentStep <= presentationCriteria.length) {
        const criterion = presentationCriteria[currentStep - 1]
        return `Enter ${criterion.label} (max: ${criterion.max}):`
      }
    }

    if (selectedAssessment === "quiz") {
      if (!selectedQuiz) return "Select quiz number first"
      if (currentStep === 0) return "Enter Student ID:"
      if (currentStep === 1) return `Enter Quiz ${selectedQuiz} marks:`
    }

    return "Enter 0 to save and continue with next student"
  }

  const handleCourseInfoSubmit = () => {
    if (
      tempCourseInfo.department &&
      tempCourseInfo.batch &&
      tempCourseInfo.section &&
      tempCourseInfo.course &&
      tempCourseInfo.courseCode
    ) {
      setCourseInfo(tempCourseInfo)
      setShowCourseModal(false)
    }
  }

  const editCourseInfo = () => {
    setTempCourseInfo(courseInfo)
    setShowCourseModal(true)
  }

  const renderTable = () => {
    if (selectedAssessment === "assignment" && assignmentData.length > 0) {
      return (
        <Card className="mt-8 shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Assignment Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Student ID</TableHead>
                  {assignmentCriteria.map((criterion) => (
                    <TableHead key={criterion.key} className="font-semibold">
                      {criterion.label} ({criterion.max})
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold">Total (5)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentData.map((student) => (
                  <TableRow key={student.studentId} className="hover:bg-blue-50">
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    {assignmentCriteria.map((criterion) => (
                      <TableCell key={criterion.key}>{student.marks[criterion.key] || 0}</TableCell>
                    ))}
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">{student.total}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )
    }

    if (selectedAssessment === "presentation" && presentationData.length > 0) {
      return (
        <Card className="mt-8 shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Presentation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Student ID</TableHead>
                  {presentationCriteria.map((criterion) => (
                    <TableHead key={criterion.key} className="font-semibold">
                      {criterion.label} ({criterion.max})
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold">Total (8)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presentationData.map((student) => (
                  <TableRow key={student.studentId} className="hover:bg-green-50">
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    {presentationCriteria.map((criterion) => (
                      <TableCell key={criterion.key}>{student.marks[criterion.key] || 0}</TableCell>
                    ))}
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">{student.total}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )
    }

    if (selectedAssessment === "quiz" && quizData.length > 0) {
      return (
        <Card className="mt-8 shadow-lg border-0 bg-gradient-to-br from-white to-yellow-50">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Student ID</TableHead>
                  <TableHead className="font-semibold">Quiz 1</TableHead>
                  <TableHead className="font-semibold">Quiz 2</TableHead>
                  <TableHead className="font-semibold">Quiz 3</TableHead>
                  <TableHead className="font-semibold">Average (15)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizData.map((student) => (
                  <TableRow key={student.studentId} className="hover:bg-yellow-50">
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.quiz1}</TableCell>
                    <TableCell>{student.quiz2}</TableCell>
                    <TableCell>{student.quiz3}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                        {student.average.toFixed(2)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )
    }

    if (
      (selectedAssessment === "midterm" && midtermData.length > 0) ||
      (selectedAssessment === "final" && finalData.length > 0)
    ) {
      const data = selectedAssessment === "midterm" ? midtermData : finalData
      const maxTotal = selectedAssessment === "midterm" ? 25 : 40
      const colorClass = selectedAssessment === "midterm" ? "from-purple-500 to-violet-500" : "from-red-500 to-pink-500"
      const bgClass = selectedAssessment === "midterm" ? "to-purple-50" : "to-red-50"
      const hoverClass = selectedAssessment === "midterm" ? "hover:bg-purple-50" : "hover:bg-red-50"

      return (
        <Card className={`mt-8 shadow-lg border-0 bg-gradient-to-br from-white ${bgClass}`}>
          <CardHeader className={`bg-gradient-to-r ${colorClass} text-white rounded-t-lg`}>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              {selectedAssessment === "midterm" ? "Midterm" : "Final"} Results
            </CardTitle>
            {questionFormat && (
              <CardDescription className="text-white/90">Question Format: {questionFormat}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Student ID</TableHead>
                  {data.length > 0 &&
                    Object.keys(data[0].marks).map((question) => (
                      <TableHead key={question} className="font-semibold">
                        Q{question}
                      </TableHead>
                    ))}
                  <TableHead className="font-semibold">Total ({maxTotal})</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((student) => (
                  <TableRow key={student.studentId} className={hoverClass}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    {Object.entries(student.marks).map(([question, mark]) => (
                      <TableCell key={question}>{mark}</TableCell>
                    ))}
                    <TableCell>
                      <Badge className={`bg-gradient-to-r ${colorClass}`}>{student.total}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  const [activeTab, setActiveTab] = useState<"assessment" | "documents" | "courses">("assessment")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Course Information
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Please enter the course details before proceeding with mark input.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                Department
              </Label>
              <Input
                id="department"
                value={tempCourseInfo.department}
                onChange={(e) => setTempCourseInfo((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Computer Science"
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch" className="text-sm font-medium text-gray-700">
                Batch
              </Label>
              <Input
                id="batch"
                value={tempCourseInfo.batch}
                onChange={(e) => setTempCourseInfo((prev) => ({ ...prev, batch: e.target.value }))}
                placeholder="e.g., 2023"
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section" className="text-sm font-medium text-gray-700">
                Section
              </Label>
              <Input
                id="section"
                value={tempCourseInfo.section}
                onChange={(e) => setTempCourseInfo((prev) => ({ ...prev, section: e.target.value }))}
                placeholder="e.g., A"
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course" className="text-sm font-medium text-gray-700">
                Course
              </Label>
              <Input
                id="course"
                value={tempCourseInfo.course}
                onChange={(e) => setTempCourseInfo((prev) => ({ ...prev, course: e.target.value }))}
                placeholder="e.g., Data Structures"
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCode" className="text-sm font-medium text-gray-700">
                Course Code
              </Label>
              <Input
                id="courseCode"
                value={tempCourseInfo.courseCode}
                onChange={(e) => setTempCourseInfo((prev) => ({ ...prev, courseCode: e.target.value }))}
                placeholder="e.g., CSE101, MATH201"
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCourseInfoSubmit}
              disabled={
                !tempCourseInfo.department ||
                !tempCourseInfo.batch ||
                !tempCourseInfo.section ||
                !tempCourseInfo.course ||
                !tempCourseInfo.courseCode
              }
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!showCourseModal && (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Mark Input System
                </h1>
                <p className="text-gray-600 mt-1">Manage student assessments and grades</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                
               
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 capitalize">{user?.role?.replace("_", " ")}</p>
                      <Badge
                        className={`text-xs ${user?.role === "module_leader" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
                      >
                        {user?.department}
                      </Badge>
                    </div>
                  </div>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Avatar className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500">
                    <AvatarFallback className="text-white font-semibold">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                     
                        <DropdownMenuItem>
                          <Link href="/profile" className="flex items-center gap-2">
                            
                          Profile
                          </Link>
                          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem  onClick={logout}>
                          Log out
                          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button> */}
              </div>
            </div>
          </div>

          {/* Course Info */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Course Information</CardTitle>
                  <CardDescription className="text-gray-600">Current course details</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={editCourseInfo}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-200">
                  Department: {courseInfo.department}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-800 border-green-200">
                  Batch: {courseInfo.batch}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 bg-purple-100 text-purple-800 border-purple-200">
                  Section: {courseInfo.section}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 bg-orange-100 text-orange-800 border-orange-200">
                  Course: {courseInfo.course}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 bg-pink-100 text-pink-800 border-pink-200">
                  Code: {courseInfo.courseCode}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tab Navigation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-2">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("assessment")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === "assessment"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                <BarChart3 className="w-5 h-5" />
                Assessment Input
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === "documents"
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                <FileText className="w-5 h-5" />
                Document Submission
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === "courses"
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
              >
                <GraduationCap className="w-5 h-5" />
                Courses
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "assessment" && (
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Assessment Input</CardTitle>
                <CardDescription className="text-gray-600">
                  Select assessment type and enter student marks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {assessmentTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <Card
                        key={type.value}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 border-2 ${selectedAssessment === type.value
                          ? "border-blue-500 shadow-lg"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
                        onClick={() => handleAssessmentChange(type.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <div
                            className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center`}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900">{type.label}</h3>
                          <p className="text-sm text-gray-600">{type.total} marks</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {selectedAssessment === "quiz" && (
                  <div className="space-y-2">
                    <Label htmlFor="quiz" className="text-sm font-medium text-gray-700">
                      Quiz Number
                    </Label>
                    <Select
                      value={selectedQuiz?.toString() || ""}
                      onValueChange={(value) => setSelectedQuiz(Number.parseInt(value) as 1 | 2 | 3)}
                    >
                      <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Select quiz number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Quiz 1</SelectItem>
                        <SelectItem value="2">Quiz 2</SelectItem>
                        <SelectItem value="3">Quiz 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedAssessment && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="input" className="text-sm font-medium text-gray-700">
                          {getCurrentPrompt()}
                        </Label>
                        <div className="flex gap-3">
                          <Input
                            id="input"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleInputSubmit()}
                            placeholder="Enter value..."
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                          <Button
                            onClick={handleInputSubmit}
                            className="h-11 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            Submit
                          </Button>
                        </div>
                      </div>

                      {(selectedAssessment === "assignment" || selectedAssessment === "presentation") &&
                        currentStudentId && (
                          <Button
                            variant="outline"
                            onClick={() => setFullMarks(selectedAssessment as "assignment" | "presentation")}
                            className="border-green-200 text-green-600 hover:bg-green-50"
                          >
                            Set Full Marks for {currentStudentId}
                          </Button>
                        )}

                      {currentStudentId && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Badge variant="outline" className="border-blue-200 text-blue-700">
                            Current Student: {currentStudentId}
                          </Badge>
                          {Object.keys(tempMarks).length > 0 && (
                            <span className="text-sm text-blue-600">
                              Progress: {Object.keys(tempMarks).length} items entered
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "documents" && (
            <DocumentSubmissionTab courseInfo={courseInfo} teacherInfo={teacherInfo} userInfo={userInfo} />
          )}

          {activeTab === "courses" && <CoursesPage userInfo={userInfo} />}

          {renderTable()}

          <div className="text-center text-gray-500 mt-8 ">
            <span className="">  

            © {new Date().getFullYear()} Mark Input System. All rights reserved.  
            Developed by{" "}
            </span>
            <span>  

            <Link
              href="/developers-info" 
              className="text-blue-600 hover:underline"
            >
              Team X
            </Link>
            </span>
        </div>
        </div>
      )}
    </div>
  )
}
