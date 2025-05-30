"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Building2,
  FileText,
  GraduationCap,
  CheckCircle,
  Plus,
  User,
  LogOut,
  Shield,
  Home,
  BookOpen,
} from "lucide-react"
import StudentManagement from "@/components/student-management"
import InternshipManagement from "@/components/internship-management"
import DocumentWorkflow from "@/components/document-workflow"
import CompanyManagement from "@/components/company-management"
import AcademicStaffManagement from "@/components/academic-staff-management"
import UserProfile from "@/components/user-profile"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { permissions } from "@/lib/permissions"
import RoleBasedWrapper from "@/components/role-based-wrapper"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import QuickActionDialogs from "@/components/quick-action-dialogs"

export default function Dashboard() {
  const { user, userRole, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInternships: 0,
    pendingDocuments: 0,
    completedProjects: 0,
  })

  const [quickActionDialogs, setQuickActionDialogs] = useState({
    student: false,
    company: false,
    internship: false,
    document: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Load role-specific stats
    const loadStats = () => {
      if (userRole === "student") {
        setStats({
          totalStudents: 1, // Only themselves
          activeInternships: 1, // Their internship
          pendingDocuments: 3, // Their documents
          completedProjects: 0, // Their projects
        })
      } else if (userRole === "teacher") {
        setStats({
          totalStudents: 45, // Students they supervise
          activeInternships: 12, // Internships they supervise
          pendingDocuments: 8, // Documents awaiting their review
          completedProjects: 23, // Projects they've supervised
        })
      } else if (userRole === "industrial_tutor") {
        setStats({
          totalStudents: 8, // Students at their company
          activeInternships: 5, // Active internships at company
          pendingDocuments: 2, // Company documents
          completedProjects: 15, // Completed internships
        })
      } else {
        // Admin sees everything
        setStats({
          totalStudents: 524,
          activeInternships: 187,
          pendingDocuments: 23,
          completedProjects: 156,
        })
      }
    }

    loadStats()
  }, [userRole])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      console.log("Logout function called")
      logout() // Call the auth context logout
      console.log("Logout completed, redirecting to home...")

      // Force redirect to home page
      window.location.href = "/home"
    } catch (error) {
      console.error("Logout error:", error)
      // Even if logout fails, redirect to home
      window.location.href = "/home"
    }
  }

  const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <Badge variant={trend > 0 ? "default" : "secondary"} className="mt-1">
            {trend > 0 ? "+" : ""}
            {trend}% from last month
          </Badge>
        )}
      </CardContent>
    </Card>
  )

  const RecentActivity = () => {
    const getActivitiesByRole = () => {
      if (userRole === "student") {
        return [
          {
            type: "internship",
            message: "Your internship application was approved",
            time: "2 hours ago",
            status: "completed",
          },
          {
            type: "document",
            message: "Please sign your internship agreement",
            time: "1 day ago",
            status: "pending",
          },
          {
            type: "project",
            message: "PFE project proposal submitted",
            time: "3 days ago",
            status: "review",
          },
        ]
      } else if (userRole === "teacher") {
        return [
          {
            type: "project",
            message: "New PFE project proposal requires review",
            time: "1 hour ago",
            status: "pending",
          },
          {
            type: "internship",
            message: "Student evaluation form submitted",
            time: "4 hours ago",
            status: "review",
          },
          {
            type: "student",
            message: "Student requested supervision meeting",
            time: "1 day ago",
            status: "info",
          },
        ]
      } else if (userRole === "industrial_tutor") {
        return [
          {
            type: "internship",
            message: "New intern started at your company",
            time: "2 hours ago",
            status: "info",
          },
          {
            type: "document",
            message: "Internship evaluation due next week",
            time: "1 day ago",
            status: "pending",
          },
          {
            type: "student",
            message: "Intern submitted weekly report",
            time: "2 days ago",
            status: "completed",
          },
        ]
      } else {
        return [
          {
            type: "internship",
            message: "New internship application from John Doe",
            time: "2 hours ago",
            status: "pending",
          },
          {
            type: "document",
            message: "Internship agreement signed by TechCorp",
            time: "4 hours ago",
            status: "completed",
          },
          {
            type: "project",
            message: 'PFE project "AI Chatbot" submitted for review',
            time: "1 day ago",
            status: "review",
          },
          { type: "student", message: "Student profile updated: Jane Smith", time: "2 days ago", status: "info" },
        ]
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates relevant to your role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {getActivitiesByRole().map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border">
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.status === "completed"
                    ? "bg-green-500"
                    : activity.status === "pending"
                      ? "bg-yellow-500"
                      : activity.status === "review"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <Badge
                variant={
                  activity.status === "completed" ? "default" : activity.status === "pending" ? "secondary" : "outline"
                }
              >
                {activity.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const QuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Available actions for your role</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <RoleBasedWrapper allowedRoles={["admin", "teacher"]}>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setQuickActionDialogs((prev) => ({ ...prev, student: true }))}
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">New Student</span>
          </Button>
        </RoleBasedWrapper>

        <RoleBasedWrapper allowedRoles={["admin"]}>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setQuickActionDialogs((prev) => ({ ...prev, company: true }))}
          >
            <Building2 className="h-5 w-5" />
            <span className="text-sm">Add Company</span>
          </Button>
        </RoleBasedWrapper>

        <RoleBasedWrapper allowedRoles={["admin", "teacher", "industrial_tutor"]}>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setQuickActionDialogs((prev) => ({ ...prev, document: true }))}
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm">Create Document</span>
          </Button>
        </RoleBasedWrapper>

        <RoleBasedWrapper allowedRoles={["admin", "teacher"]}>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setQuickActionDialogs((prev) => ({ ...prev, internship: true }))}
          >
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm">New Internship</span>
          </Button>
        </RoleBasedWrapper>

        {/* Student-specific actions */}
        <RoleBasedWrapper allowedRoles={["student"]}>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <FileText className="h-5 w-5" />
            <span className="text-sm">Submit Report</span>
          </Button>
        </RoleBasedWrapper>

        <RoleBasedWrapper allowedRoles={["student"]}>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm">View Internship</span>
          </Button>
        </RoleBasedWrapper>
      </CardContent>
    </Card>
  )

  // Get available tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = [{ id: "overview", label: "Overview" }]

    if (permissions.canViewStudents(userRole)) {
      baseTabs.push({ id: "students", label: "Students" })
    }

    if (permissions.canViewInternships(userRole)) {
      baseTabs.push({ id: "internships", label: "Internships" })
    }

    if (permissions.canViewDocuments(userRole)) {
      baseTabs.push({ id: "documents", label: "Documents" })
    }

    if (permissions.canViewCompanies(userRole)) {
      baseTabs.push({ id: "companies", label: "Companies" })
    }

    if (permissions.canViewAcademicStaff(userRole)) {
      baseTabs.push({ id: "staff", label: "Academic Staff" })
    }

    baseTabs.push({ id: "profile", label: "My Profile" })

    return baseTabs
  }

  const availableTabs = getAvailableTabs()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Academic Management System</h1>
                <p className="text-sm text-gray-500">
                  {userRole === "admin" && "Administrator Dashboard"}
                  {userRole === "teacher" && "Teacher Dashboard"}
                  {userRole === "student" && "Student Portal"}
                  {userRole === "industrial_tutor" && "Company Supervisor Dashboard"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {userRole === "admin" && (
                <Badge variant="default" className="bg-red-600">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}

              {/* Navigation Buttons */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/home")}
                  className="flex items-center space-x-1"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/library")}
                  className="flex items-center space-x-1"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Library</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user?.name?.charAt(0) || "U"}</span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole?.replace("_", " ")}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => router.push("/home")}
                      className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => router.push("/library")}
                      className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Library</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList
            className="grid w-full"
            style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}
          >
            {availableTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title={userRole === "student" ? "My Status" : "Total Students"}
                value={stats.totalStudents}
                icon={Users}
                description={userRole === "student" ? "Active student" : "Registered students"}
                trend={userRole === "admin" ? 5 : undefined}
              />
              <StatCard
                title={userRole === "student" ? "My Internship" : "Active Internships"}
                value={stats.activeInternships}
                icon={Building2}
                description={userRole === "student" ? "Current internship" : "Ongoing internships"}
                trend={userRole === "admin" ? 12 : undefined}
              />
              <StatCard
                title="Pending Documents"
                value={stats.pendingDocuments}
                icon={FileText}
                description={userRole === "student" ? "Documents to sign" : "Awaiting signatures"}
                trend={userRole === "admin" ? -8 : undefined}
              />
              <StatCard
                title="Completed Projects"
                value={stats.completedProjects}
                icon={CheckCircle}
                description={userRole === "student" ? "Projects completed" : "PFE projects finished"}
                trend={userRole === "admin" ? 15 : undefined}
              />
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>
          </TabsContent>

          {permissions.canViewStudents(userRole) && (
            <TabsContent value="students">
              <StudentManagement />
            </TabsContent>
          )}

          {permissions.canViewInternships(userRole) && (
            <TabsContent value="internships">
              <InternshipManagement />
            </TabsContent>
          )}

          {permissions.canViewDocuments(userRole) && (
            <TabsContent value="documents">
              <DocumentWorkflow />
            </TabsContent>
          )}

          {permissions.canViewCompanies(userRole) && (
            <TabsContent value="companies">
              <CompanyManagement />
            </TabsContent>
          )}

          {permissions.canViewAcademicStaff(userRole) && (
            <TabsContent value="staff">
              <AcademicStaffManagement />
            </TabsContent>
          )}

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
        </Tabs>

        <QuickActionDialogs
          dialogs={quickActionDialogs}
          setDialogs={setQuickActionDialogs}
          onSuccess={(type) => {
            console.log(`${type} created successfully`)
            if (type === "student" && permissions.canViewStudents(userRole)) setActiveTab("students")
            if (type === "company" && permissions.canViewCompanies(userRole)) setActiveTab("companies")
            if (type === "internship" && permissions.canViewInternships(userRole)) setActiveTab("internships")
            if (type === "document" && permissions.canViewDocuments(userRole)) setActiveTab("documents")
          }}
        />
      </main>
    </div>
  )
}
