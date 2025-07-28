"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  BookOpen,
  Settings,
  Bell,
  Shield,
  Camera,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Key,
  Activity,
  BarChart3,
  Clock,
  FileText,
} from "lucide-react"
import { useAuth } from "./auth-provider"

interface ProfilePageProps {
  onBack: () => void
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: user?.name || "Dr. John Smith",
    email: user?.email || "john.smith@university.edu",
    phone: user?.mobile || "+1234567890",
    department: user?.department || "Computer Science",
    designation: user?.designation || "Assistant Professor",
    employeeId: user?.employeeId || "EMP001",
    bio: "Passionate educator with 8+ years of experience in computer science education. Specialized in database systems, web development, and software engineering. Committed to innovative teaching methods and student success.",
    address: "123 University Avenue, Academic City, AC 12345",
    dateOfBirth: "1985-06-15",
    joiningDate: "2018-08-01",
    qualification: "Ph.D. in Computer Science",
    specialization: "Database Systems, Web Development",
    researchInterests: "Machine Learning, Data Mining, Educational Technology",
    officeLocation: "Room 301, CS Building",
    officeHours: "Mon-Fri: 2:00 PM - 4:00 PM",
  })

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    marketingEmails: false,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "department", // public, department, private
    showEmail: true,
    showPhone: false,
    showOfficeHours: true,
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Activity stats (mock data)
  const activityStats = {
    coursesTeaching: 4,
    studentsEnrolled: 156,
    assignmentsGraded: 89,
    documentsUploaded: 23,
    averageGrade: 85.4,
    completionRate: 94,
    lastLogin: "2025-01-27 09:30 AM",
    totalLogins: 247,
  }

  // Recent activities (mock data)
  const recentActivities = [
    {
      id: "1",
      type: "grade",
      description: "Graded Assignment 2 for CSE301",
      timestamp: "2 hours ago",
      icon: Award,
    },
    {
      id: "2",
      type: "upload",
      description: "Uploaded lecture notes for Database Systems",
      timestamp: "1 day ago",
      icon: FileText,
    },
    {
      id: "3",
      type: "course",
      description: "Updated course syllabus for CSE301",
      timestamp: "2 days ago",
      icon: BookOpen,
    },
    {
      id: "4",
      type: "system",
      description: "Profile information updated",
      timestamp: "3 days ago",
      icon: User,
    },
  ]

  const handleSaveProfile = () => {
    // In real app, this would make an API call
    setIsEditing(false)
    // Show success message
  }

  const handlePasswordChange = () => {
    // In real app, this would make an API call
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      // Show error message
      return
    }
    setShowPasswordDialog(false)
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    // Show success message
  }

  const calculateProfileCompletion = () => {
    const fields = [
      profileData.name,
      profileData.email,
      profileData.phone,
      profileData.bio,
      profileData.address,
      profileData.qualification,
      profileData.specialization,
    ]
    const completedFields = fields.filter((field) => field && field.trim() !== "").length
    return Math.round((completedFields / fields.length) * 100)
  }

  const profileCompletion = calculateProfileCompletion()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
          >
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Profile Completion</h3>
              <p className="text-sm text-gray-600">Complete your profile to get the most out of the system</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{profileCompletion}%</div>
              <Progress value={profileCompletion} className="w-32 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <Avatar className="h-32 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto">
                    <AvatarFallback className="text-white font-bold text-3xl">
                      {profileData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl font-bold">{profileData.name}</CardTitle>
                <CardDescription className="text-sm">{profileData.designation}</CardDescription>
                <Badge
                  className={`mt-2 ${user?.role === "module_leader" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}
                >
                  {user?.role?.replace("_", " ").toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{profileData.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>ID: {profileData.employeeId}</span>
                </div>
              </CardContent>
            </Card>

            {/* Personal Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
                  <CardDescription>Your basic personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Academic Information Tab */}
        <TabsContent value="academic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                  Academic Details
                </CardTitle>
                <CardDescription>Your academic and professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={profileData.department}
                    onValueChange={(value) => setProfileData({ ...profileData, department: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={profileData.designation}
                    onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input id="employeeId" value={profileData.employeeId} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate">Joining Date</Label>
                  <Input
                    id="joiningDate"
                    type="date"
                    value={profileData.joiningDate}
                    onChange={(e) => setProfileData({ ...profileData, joiningDate: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  Professional Details
                </CardTitle>
                <CardDescription>Your qualifications and expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qualification">Highest Qualification</Label>
                  <Input
                    id="qualification"
                    value={profileData.qualification}
                    onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={profileData.specialization}
                    onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="research">Research Interests</Label>
                  <Textarea
                    id="research"
                    value={profileData.researchInterests}
                    onChange={(e) => setProfileData({ ...profileData, researchInterests: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office">Office Location</Label>
                  <Input
                    id="office"
                    value={profileData.officeLocation}
                    onChange={(e) => setProfileData({ ...profileData, officeLocation: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Office Hours</Label>
                  <Input
                    id="hours"
                    value={profileData.officeHours}
                    onChange={(e) => setProfileData({ ...profileData, officeHours: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Stats */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Activity Overview
                </CardTitle>
                <CardDescription>Your system usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{activityStats.coursesTeaching}</div>
                    <div className="text-sm text-gray-600">Courses Teaching</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{activityStats.studentsEnrolled}</div>
                    <div className="text-sm text-gray-600">Students Enrolled</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{activityStats.assignmentsGraded}</div>
                    <div className="text-sm text-gray-600">Assignments Graded</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{activityStats.documentsUploaded}</div>
                    <div className="text-sm text-gray-600">Documents Uploaded</div>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Grade</span>
                    <span className="text-sm font-bold text-green-600">{activityStats.averageGrade}%</span>
                  </div>
                  <Progress value={activityStats.averageGrade} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm font-bold text-blue-600">{activityStats.completionRate}%</span>
                  </div>
                  <Progress value={activityStats.completionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="w-6 h-6 text-green-600" />
                  Recent Activities
                </CardTitle>
                <CardDescription>Your latest actions in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const IconComponent = activity.icon
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium">{activityStats.lastLogin}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Total Logins:</span>
                    <span className="font-medium">{activityStats.totalLogins}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Bell className="w-6 h-6 text-orange-600" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="course-updates">Course Updates</Label>
                    <p className="text-sm text-gray-500">Notifications about course changes</p>
                  </div>
                  <Switch
                    id="course-updates"
                    checked={notifications.courseUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, courseUpdates: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="system-alerts">System Alerts</Label>
                    <p className="text-sm text-gray-500">Important system notifications</p>
                  </div>
                  <Switch
                    id="system-alerts"
                    checked={notifications.systemAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Weekly activity summaries</p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Eye className="w-6 h-6 text-purple-600" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Control who can see your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value) => setPrivacy({ ...privacy, profileVisibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Everyone can see</SelectItem>
                      <SelectItem value="department">Department - Only department members</SelectItem>
                      <SelectItem value="private">Private - Only you can see</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-email">Show Email Address</Label>
                    <p className="text-sm text-gray-500">Display email in public profile</p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-phone">Show Phone Number</Label>
                    <p className="text-sm text-gray-500">Display phone in public profile</p>
                  </div>
                  <Switch
                    id="show-phone"
                    checked={privacy.showPhone}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showPhone: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-office-hours">Show Office Hours</Label>
                    <p className="text-sm text-gray-500">Display office hours publicly</p>
                  </div>
                  <Switch
                    id="show-office-hours"
                    checked={privacy.showOfficeHours}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showOfficeHours: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-600" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Account Security Status</span>
                </div>
                <p className="text-sm text-yellow-700">Your account is secure. Last password change was 45 days ago.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-500">Last changed 45 days ago</p>
                  </div>
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                        <Key className="w-4 h-4" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new secure password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handlePasswordChange} className="bg-red-600 hover:bg-red-700">
                          Change Password
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" disabled>
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Login Sessions</h4>
                    <p className="text-sm text-gray-500">Manage your active sessions</p>
                  </div>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
