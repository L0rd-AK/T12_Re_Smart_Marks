"use client"

import { useState } from "react"
import {
    ArrowLeft,
    BookOpen,
    Users,
    FileText,
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
    Tag,
} from "lucide-react"
import { useGetCourseSharedDocumentsQuery, type DocumentDistribution, type FileMetadata } from "../../redux/api/documentDistributionApi"
import LoadingSpinner from "../../components/LoadingSpinner"

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
    downloadUrl?: string
    isShared?: boolean
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

export default function CourseDetailsPage({ courseId, onBack }: CourseDetailsPageProps) {
    const [showMaterialModal, setShowMaterialModal] = useState(false)
    const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'teachers' | 'schedule' | 'assessment' | 'announcements'>('overview')

    // Fetch shared documents for this course
    const { 
        data: sharedDocumentsData, 
        isLoading: sharedDocumentsLoading, 
        error: sharedDocumentsError 
    } = useGetCourseSharedDocumentsQuery(courseId)
    
    const sharedDocuments = sharedDocumentsData?.data || []

    // Mock course data - in real app this would come from API
    const course: Course = {
        id: courseId,
        code: "CS201",
        title: "Data Structures",
        department: "Computer Science",
        semester: "Summer 2025",
        creditHours: 3,
        moduleLeader: "amit",
        moduleLeaderEmail: "amit@gmail.com",
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

    // Transform shared documents to course materials format
    const transformSharedDocuments = () => {
        return sharedDocuments.flatMap((doc: DocumentDistribution) => 
            doc.files.map((file: FileMetadata, index: number) => ({
                id: `shared-${doc.distributionId}-${index}`,
                name: file.originalName,
                type: file.mimeType,
                size: file.fileSize,
                uploadDate: new Date(file.uploadedAt).toLocaleDateString(),
                uploadedBy: doc.moduleLeader.name,
                category: doc.category as "syllabus" | "lecture" | "assignment" | "exam" | "reference",
                url: file.liveViewLink,
                downloadUrl: file.downloadLink,
                isShared: true
            }))
        )
    }

    // Combine mock materials with shared documents
    const allCourseMaterials = [
        ...courseMaterials,
        ...transformSharedDocuments()
    ]

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
        return <span className={`badge capitalize ${colors[category as keyof typeof colors]}`}>
            {category}
        </span>

    }

    const getPriorityBadge = (priority: string) => {
        const colors = {
            high: "bg-red-100 text-red-800 border-red-200",
            medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
            low: "bg-green-100 text-green-800 border-green-200",
        }
        return <span className={`badge capitalize ${colors[priority as keyof typeof colors]}`}>
            {priority}
        </span>

    }

    const classProgress = Math.round((course.conductedClasses / course.totalClasses) * 100)

    return (
        <div className=" bg-white  p-6">
            <div className="container mx-auto space-y-6 min-h-[calc(100vh-64px)]">

                {/* Header with Back Button */}
                <div className="flex items-center  gap-4">
                    <button
                        onClick={onBack}
                        className="btn btn-outline border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Courses
                    </button>

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
                    {/* Credit Hours */}
                    <div className="card shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-0">
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Credit Hours</p>
                                    <p className="text-3xl font-bold text-blue-900">{course.creditHours}</p>
                                </div>
                                <GraduationCap className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Enrolled Teachers */}
                    <div className="card shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-0">
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Enrolled Teachers</p>
                                    <p className="text-3xl font-bold text-green-900">{course.enrolledTeachers.length}</p>
                                </div>
                                <Users className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Class Progress */}
                    <div className="card shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 border-0">
                        <div className="card-body p-6">
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
                        </div>
                    </div>

                    {/* Document Progress */}
                    <div className="card shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border-0">
                        <div className="card-body p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600">Document Progress</p>
                                    <p className="text-3xl font-bold text-purple-900">{course.documentProgress}%</p>
                                </div>
                                <FileText className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Main Content Tabs */}
                <div className="w-full">
                    <div className="tabs bg-gray-100 backdrop-blur-sm shadow-lg grid grid-cols-5 w-full rounded-lg overflow-hidden">
                        <button
                            className={`tab flex items-center gap-2 transition-all duration-150 ${activeTab === 'overview' ? '!bg-indigo-600 !text-white font-semibold shadow' : '!text-gray-700 hover:!bg-indigo-100'}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <BookOpen className="w-4 h-4" />
                            Overview
                        </button>
                        <button
                            className={`tab flex items-center gap-2 transition-all duration-150 ${activeTab === 'materials' ? '!bg-green-600 !text-white font-semibold shadow' : '!text-gray-700 hover:!bg-green-100'}`}
                            onClick={() => setActiveTab('materials')}
                        >
                            <FileText className="w-4 h-4" />
                            Materials
                        </button>
                        <button
                            className={`tab flex items-center gap-2 transition-all duration-150 ${activeTab === 'teachers' ? '!bg-purple-600 !text-white font-semibold shadow' : '!text-gray-700 hover:!bg-purple-100'}`}
                            onClick={() => setActiveTab('teachers')}
                        >
                            <Users className="w-4 h-4" />
                            Teachers
                        </button>
                        {/* <button
                        className={`tab flex items-center gap-2 transition-all duration-150 ${activeTab === 'schedule' ? '!bg-yellow-500 !text-white font-semibold shadow' : '!text-gray-700 hover:!bg-yellow-100'}`}
                        onClick={() => setActiveTab('schedule')}
                    >
                        <Calendar className="w-4 h-4" />
                        Schedule
                    </button> */}
                        <button
                            className={`tab flex items-center gap-2 transition-all duration-150 ${activeTab === 'assessment' ? '!bg-pink-600 !text-white font-semibold shadow' : '!text-gray-700 hover:!bg-pink-100'}`}
                            onClick={() => setActiveTab('assessment')}
                        >
                            <Award className="w-4 h-4" />
                            Assessment
                        </button>
                        <button
                            className={`tab flex items-center gap-2 transition-all duration-150 ${activeTab === 'announcements' ? '!bg-red-600 !text-white font-semibold shadow' : '!text-gray-700 hover:!bg-red-100'}`}
                            onClick={() => setActiveTab('announcements')}
                        >
                            <AlertCircle className="w-4 h-4" />
                            Announcements
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-4">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && <div className="space-y-6">
                            {/* BLC Link and Enrollment Key */}
                            <div className="card shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <ExternalLink className="w-6 h-6 text-blue-600" />
                                        Blended Learning Center (BLC)
                                    </h2>
                                    <p className="text-gray-600">Access online course materials and activities</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="p-4 bg-white rounded-lg border border-blue-200">
                                            <label className="text-sm font-medium text-blue-700 mb-2 block">BLC Course Link</label>
                                            <div className="flex items-center gap-2">
                                                <input value={course.blcLink} readOnly className="input input-bordered input-sm w-full bg-blue-50 border-blue-200 text-sm" />
                                                <button onClick={() => window.open(course.blcLink, '_blank')} className="btn btn-sm btn-primary">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white rounded-lg border border-green-200">
                                            <label className="text-sm font-medium text-green-700 mb-2 block">Enrollment Key</label>
                                            <div className="flex items-center gap-2">
                                                <input value={course.enrollmentKey} readOnly className="input input-bordered input-sm w-full bg-green-50 border-green-200 font-mono text-sm" />
                                                <button onClick={() => navigator.clipboard.writeText(course.enrollmentKey)} className="btn btn-sm btn-outline border-green-200 text-green-600">
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 bg-yellow-50 p-3 mt-4 rounded-lg border border-yellow-200">
                                        <AlertCircle className="w-4 h-4 inline mr-2 text-yellow-600" />
                                        <strong>Note:</strong> Use the enrollment key to join the BLC course. Share this key only with enrolled students.
                                    </div>
                                </div>
                            </div>

                            {/* Course Templates and Files */}
                            <div className="card shadow-xl bg-gradient-to-r from-purple-50 to-pink-50">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-6 h-6 text-purple-600" />
                                        Course Templates & Files
                                    </h2>
                                    <p className="text-gray-600">Download course templates and outcome files</p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        {/* Repeat the block below for each file type if exists */}
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
                                                    <button onClick={() => window.open(course.courseOutcomeFile?.url, '_blank')} className="btn btn-sm btn-primary flex-1">
                                                        <Eye className="w-4 h-4 mr-2" /> View
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline border-purple-200 text-purple-600"
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = course.courseOutcomeFile?.url || '';
                                                            link.download = course.courseOutcomeFile?.name || '';
                                                            link.click();
                                                        }}>
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">Uploaded: {course.courseOutcomeFile.uploadDate}</p>
                                            </div>
                                        )}
                                        {/* ...Repeat for assignmentTemplate and presentationTemplate */}
                                    </div>
                                </div>
                            </div>

                            {/* Description & Prerequisites */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="card shadow-xl bg-white backdrop-blur-sm">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                            <BookOpen className="w-6 h-6 text-blue-600" /> Course Description
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">{course.description}</p>
                                    </div>
                                </div>
                                <div className="card shadow-xl bg-white backdrop-blur-sm">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                            <Target className="w-6 h-6 text-orange-600" /> Prerequisites
                                        </h2>
                                        <div className="space-y-2">
                                            {course.prerequisites.map((prereq, index) => (
                                                <div key={index} className="badge badge-outline mr-2 mb-2">{prereq}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Learning Outcomes */}
                            <div className="card shadow-xl bg-white backdrop-blur-sm">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <Target className="w-6 h-6 text-green-600" /> Learning Outcomes
                                    </h2>
                                    <p className="text-gray-600">Upon completion of this course, students will be able to:</p>
                                    <div className="space-y-3 mt-4">
                                        {course.learningOutcomes.map((outcome, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-gray-700">{outcome}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>}
                        {/* Materials Tab */}
                        {activeTab === 'materials' && <div className="space-y-6">
                            <div className="card bg-white backdrop-blur-sm shadow-xl border-0">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                        Course Materials
                                    </h2>
                                    <p className="text-sm text-gray-600 mb-4">
                                        All uploaded course materials and shared documents ({allCourseMaterials.length} total)
                                    </p>

                                    {sharedDocumentsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <LoadingSpinner />
                                            <span className="ml-2">Loading shared documents...</span>
                                        </div>
                                    ) : sharedDocumentsError ? (
                                        <div className="text-center py-8">
                                            <div className="text-red-600">
                                                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg font-medium">Error loading shared documents</p>
                                                <p className="text-sm mt-2">Error: {JSON.stringify(sharedDocumentsError)}</p>
                                                <p className="text-sm mt-2">Course ID: {courseId}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {sharedDocuments.length > 0 && (
                                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-green-800 text-sm">
                                                        ✅ Found {sharedDocuments.length} shared document distribution(s) with {transformSharedDocuments().length} files
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="overflow-x-auto">
                                                <table className="table w-full border-separate border-spacing-0 rounded-lg overflow-hidden">
                                                    <thead>
                                                        <tr className="bg-blue-100/80">
                                                            <th className="font-semibold text-blue-900">Material</th>
                                                            <th className="font-semibold text-blue-900">Category</th>
                                                            <th className="font-semibold text-blue-900">Size</th>
                                                            <th className="font-semibold text-blue-900">Uploaded By</th>
                                                            <th className="font-semibold text-blue-900">Date</th>
                                                            <th className="font-semibold text-blue-900">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {allCourseMaterials.map((material, idx) => (
                                                            <tr
                                                                key={material.id}
                                                                className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-blue-50/60"} hover:bg-blue-100/70`}
                                                            >
                                                                <td>
                                                                    <div className="flex items-center gap-3">
                                                                        {getCategoryIcon(material.category)}
                                                                        <div>
                                                                            <span className="font-medium text-blue-900">{material.name}</span>
                                                                            {material.isShared && (
                                                                                <span className="ml-2 badge badge-info badge-sm">Shared</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>{getCategoryBadge(material.category)}</td>
                                                                <td className="text-sm text-gray-700">{formatFileSize(material.size)}</td>
                                                                <td className="text-gray-800">{material.uploadedBy}</td>
                                                                <td className="text-sm text-gray-700">{material.uploadDate}</td>
                                                                <td>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            className="btn btn-outline btn-sm"
                                                                            onClick={() => {
                                                                                setSelectedMaterial(material)
                                                                                setShowMaterialModal(true)
                                                                            }}
                                                                            title="View material"
                                                                        >
                                                                            <Eye className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-outline btn-sm"
                                                                            onClick={() => window.open(material.downloadUrl || material.url, "_blank")}
                                                                            title="Download material"
                                                                        >
                                                                            <Download className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {allCourseMaterials.length === 0 && (
                                                    <div className="text-center py-8">
                                                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No materials available</h3>
                                                        <p className="text-gray-600">No course materials have been uploaded yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>}

                        {/* Teachers Tab */}

                        {activeTab === 'teachers' && <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {teachers.map((teacher) => (
                                    <div key={teacher.email} className="card bg-white backdrop-blur-sm shadow-xl border-0">
                                        <div className="card-body p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="avatar placeholder">
                                                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-lg font-semibold">
                                                        {teacher.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h2 className="card-title text-lg font-semibold text-gray-900">{teacher.name}</h2>
                                                    <p className="text-sm text-gray-700">{teacher.designation}</p>
                                                    {teacher.email === course.moduleLeaderEmail && (
                                                        <span className="badge badge-purple badge-outline mt-1">Module Leader</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                    <span className="font-medium text-gray-800">Employee ID:</span> <span className="text-gray-700">{teacher.employeeId}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-600" />
                                                    <span className="font-medium text-gray-800">Email:</span> <span className="text-gray-700">{teacher.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-600" />
                                                    <span className="font-medium text-gray-800">Mobile:</span> <span className="text-gray-700">{teacher.mobile}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="w-4 h-4 text-gray-600" />
                                                    <span className="font-medium text-gray-800">Specialization:</span> <span className="text-gray-700">{teacher.specialization}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-600" />
                                                    <span className="font-medium text-gray-800">Experience:</span> <span className="text-gray-700">{teacher.experience} years</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>}



                        {/* Schedule Tab */}

                        {/* {activeTab === 'schedule' && <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            Class Schedule
                            <div className="card bg-white backdrop-blur-sm shadow-xl border-0">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                        Class Schedule
                                    </h2>

                                    <div className="space-y-4 mt-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <h4 className="font-semibold text-blue-900 mb-2">Theory Classes</h4>
                                            <p className="text-blue-700">{course.schedule.theory}</p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <h4 className="font-semibold text-green-900 mb-2">Lab Sessions</h4>
                                            <p className="text-green-700">{course.schedule.lab}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            Course Timeline
                            <div className="card bg-white backdrop-blur-sm shadow-xl border-0">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <Clock className="w-6 h-6 text-orange-600" />
                                        Course Timeline
                                    </h2>

                                    <div className="space-y-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Start Date:</span>
                                            <div className="badge badge-outline">{course.startDate}</div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">End Date:</span>
                                            <div className="badge badge-outline">{course.endDate}</div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Class Progress:</span>
                                                <span className="text-sm">
                                                    {course.conductedClasses}/{course.totalClasses}
                                                </span>
                                            </div>
                                            <progress className="progress progress-info h-2 w-full" value={classProgress} max="100"></progress>
                                            <p className="text-sm text-gray-600">{classProgress}% completed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>} */}



                        {/* Assessment Tab */}


                        {activeTab === 'assessment' && <div className="space-y-6">
                            <div className="card bg-white backdrop-blur-sm shadow-xl border-0">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <Award className="w-6 h-6 text-purple-600" />
                                        Assessment Breakdown
                                    </h2>
                                    <p className="text-sm text-gray-600">Distribution of marks across different assessment types</p>

                                    {/* Grid of percentages */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                                        {Object.entries(course.assessmentBreakdown).map(([type, marks]) => (
                                            <div key={type} className="card border-2 border-gray-200">
                                                <div className="card-body p-4 text-center">
                                                    <div className="text-2xl font-bold text-gray-900 mb-1">{marks}%</div>
                                                    <div className="text-sm font-medium text-gray-600 capitalize">{type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Table */}
                                    <div className="overflow-x-auto mt-6">
                                        <table className="table w-full border-separate border-spacing-0 rounded-lg overflow-hidden">
                                            <thead>
                                                <tr className="bg-pink-100/80">
                                                    <th className="font-semibold text-pink-900">Assessment Type</th>
                                                    <th className="font-semibold text-pink-900">Weightage</th>
                                                    <th className="font-semibold text-pink-900">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-white hover:bg-pink-50/60">
                                                    <td className="font-medium text-pink-900">Assignment</td>
                                                    <td className="text-pink-900">{course.assessmentBreakdown.assignment}%</td>
                                                    <td className="text-gray-800">Individual assignments and projects</td>
                                                </tr>
                                                <tr className="bg-pink-50/60 hover:bg-pink-100/70">
                                                    <td className="font-medium text-pink-900">Presentation</td>
                                                    <td className="text-pink-900">{course.assessmentBreakdown.presentation}%</td>
                                                    <td className="text-gray-800">Oral presentations and demonstrations</td>
                                                </tr>
                                                <tr className="bg-white hover:bg-pink-50/60">
                                                    <td className="font-medium text-pink-900">Quiz</td>
                                                    <td className="text-pink-900">{course.assessmentBreakdown.quiz}%</td>
                                                    <td className="text-gray-800">Regular quizzes and class tests</td>
                                                </tr>
                                                <tr className="bg-pink-50/60 hover:bg-pink-100/70">
                                                    <td className="font-medium text-pink-900">Midterm</td>
                                                    <td className="text-pink-900">{course.assessmentBreakdown.midterm}%</td>
                                                    <td className="text-gray-800">Mid-semester examination</td>
                                                </tr>
                                                <tr className="bg-white hover:bg-pink-50/60">
                                                    <td className="font-medium text-pink-900">Final</td>
                                                    <td className="text-pink-900">{course.assessmentBreakdown.final}%</td>
                                                    <td className="text-gray-800">Final semester examination</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>}


                        {/* Announcements Tab */}
                        {activeTab === 'announcements' && <div className="space-y-6">
                            <div className="card bg-white backdrop-blur-sm shadow-xl border-0">
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                        Course Announcements
                                    </h2>
                                    <p className="text-sm text-gray-600">Latest updates and announcements for this course</p>

                                    <div className="space-y-4 mt-4">
                                        {announcements.map((announcement) => (
                                            <div key={announcement.id} className="card border-l-4 border-l-blue-500 shadow-md">
                                                <div className="card-body p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            {getPriorityBadge(announcement.priority)}
                                                            <span className="text-sm text-gray-500">{announcement.date}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 mb-2">{announcement.content}</p>
                                                    <p className="text-sm text-gray-500">Posted by: {announcement.author}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>}
                    </div>




                </div>



                {/* Material Preview Modal */}
                {showMaterialModal && selectedMaterial && (
                    <div className="modal modal-open">
                        <div className="modal-box sm:max-w-md bg-white backdrop-blur-sm border-0 shadow-2xl">
                            <h3 className="font-bold text-xl text-gray-900">Material Preview</h3>
                            <p className="text-sm text-gray-600 mb-4">{selectedMaterial.name}</p>

                            <div className="space-y-4">
                                {/* Material Info */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    {getCategoryIcon(selectedMaterial.category)}
                                    <div>
                                        <p className="font-medium">{selectedMaterial.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {formatFileSize(selectedMaterial.size)} • Uploaded by {selectedMaterial.uploadedBy}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-primary flex-1"
                                        onClick={() => window.open(selectedMaterial.url, "_blank")}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View
                                    </button>
                                    <button
                                        className="btn btn-outline flex-1"
                                        onClick={() => {
                                            const link = document.createElement("a");
                                            link.href = selectedMaterial.downloadUrl || selectedMaterial.url || "";
                                            link.download = selectedMaterial.name;
                                            link.click();
                                        }}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Close overlay */}
                        <div className="modal-backdrop" onClick={() => setShowMaterialModal(false)}></div>
                    </div>
                )}
            </div>

        </div>
    )
}
