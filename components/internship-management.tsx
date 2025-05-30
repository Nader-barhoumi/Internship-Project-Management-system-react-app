"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Eye, Calendar, Building2, User, Clock, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { permissions } from "@/lib/permissions"
import RoleBasedWrapper from "@/components/role-based-wrapper"
import { Pagination } from "@/components/ui/pagination"
import type { Internship as InternshipType } from "@/types/database"
import type { InternshipListResponse } from "@/types/api"

interface InternshipWithRelations extends InternshipType {
  student?: {
    user?: {
      first_name: string
      last_name: string
    }
    student_id: string
  }
  company?: {
    name: string
  }
  industrial_tutor?: {
    user?: {
      first_name: string
      last_name: string
    }
    job_title: string
  }
  academic_work?: {
    type: string
    department: string
  }
}

export default function InternshipManagement() {
  const { user, userRole } = useAuth()
  const { toast } = useToast()
  const [internships, setInternships] = useState<InternshipWithRelations[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState<InternshipWithRelations | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [limit] = useState(10)
  const [students, setStudents] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [tutors, setTutors] = useState<any[]>([])
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [shouldFetchTutors, setShouldFetchTutors] = useState(false)

  // Check if user has permission to access this component
  if (!permissions.canViewInternships(userRole)) {
    return null // Hide the entire component
  }

  // Fetch internships with role-based filtering
  const fetchInternships = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const filters: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      }

      if (filterStatus !== "all") {
        filters.status = filterStatus
      }

      if (filterType !== "all") {
        filters.internship_type = filterType
      }

      if (searchTerm) {
        filters.search = searchTerm
      }

      // Role-based filtering
      if (userRole === "student") {
        filters.student_id = user?.id?.toString() || ""
      } else if (userRole === "industrial_tutor") {
        filters.company_id = user?.company_id?.toString() || ""
      } else if (userRole === "teacher") {
        // Teachers see internships they supervise
        filters.supervisor_id = user?.id?.toString() || ""
      }
      // Admin sees all internships (no additional filters)

      const response = (await apiClient.getInternships(filters)) as InternshipListResponse

      // Additional client-side filtering for extra security
      let filteredInternships = response.internships || []

      if (userRole === "student") {
        // Students only see their own internships
        filteredInternships = filteredInternships.filter((internship) => internship.student_id === user?.id)
      } else if (userRole === "industrial_tutor") {
        // Industrial tutors only see internships at their company
        filteredInternships = filteredInternships.filter((internship) => internship.company_id === user?.company_id)
      } else if (userRole === "teacher") {
        // Teachers only see internships they supervise
        filteredInternships = filteredInternships.filter(
          (internship) =>
            internship.academic_supervisor_id === user?.id || internship.academic_work?.department === user?.department,
        )
      }

      setInternships(filteredInternships)
      setTotalItems(filteredInternships.length)
      setTotalPages(Math.ceil(filteredInternships.length / limit))
    } catch (err) {
      console.error("Failed to fetch internships:", err)
      setError("Failed to load internships. Please try again later.")
      toast({
        title: "Error",
        description: "Failed to load internships. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch reference data (students, companies, tutors) - only for authorized roles
  const fetchReferenceData = async () => {
    try {
      if (permissions.canCreateInternships(userRole)) {
        const [studentsRes, companiesRes] = await Promise.all([
          apiClient.getStudents({ limit: 100 }),
          apiClient.getCompanies({ limit: 100 }),
        ])
        setStudents(studentsRes.students || [])
        setCompanies(companiesRes.companies || [])
      }
    } catch (err) {
      console.error("Failed to fetch reference data:", err)
    }
  }

  // Fetch tutors for a specific company
  const fetchTutorsForCompany = async (companyId: number) => {
    try {
      const response = await apiClient.getCompany(companyId)
      if (response.company?.industrial_tutors) {
        setTutors(response.company.industrial_tutors)
      }
    } catch (err) {
      console.error("Failed to fetch tutors:", err)
    }
  }

  // Initial data load
  useEffect(() => {
    fetchInternships()
    fetchReferenceData()
  }, [page, filterStatus, filterType, userRole, user?.id])

  useEffect(() => {
    if (companyId && shouldFetchTutors) {
      fetchTutorsForCompany(companyId)
      setShouldFetchTutors(false)
    }
  }, [companyId, shouldFetchTutors])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchInternships()
      } else {
        setPage(1) // This will trigger fetchInternships via the dependency
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      on_going: "default",
      finished: "secondary",
    }
    const colors: Record<string, string> = {
      on_going: "bg-green-100 text-green-800",
      finished: "bg-gray-100 text-gray-800",
    }
    return (
      <Badge variant={variants[status] || "outline"} className={colors[status]}>
        {status === "on_going" ? "Active" : "Completed"}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "required" ? "default" : "outline"}>
        {type === "required" ? "Mandatory" : "Optional"}
      </Badge>
    )
  }

  const AddInternshipForm = () => {
    const [formData, setFormData] = useState({
      student_id: "",
      company_id: "",
      industrial_tutor_id: "",
      academic_work_id: "",
      internship_type: "required",
      start_date: "",
      end_date: "",
      specifications: {
        title: "",
        objectives: "",
        main_tasks: "",
        student_profile: "",
      },
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      try {
        const response = await apiClient.createInternship(formData)
        toast({
          title: "Success",
          description: "Internship created successfully",
        })
        setIsAddDialogOpen(false)
        fetchInternships() // Refresh the list
      } catch (err) {
        console.error("Failed to create internship:", err)
        toast({
          title: "Error",
          description: "Failed to create internship. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }

    // Fetch tutors when company is selected
    useEffect(() => {
      if (formData.company_id) {
        setCompanyId(Number(formData.company_id))
        setShouldFetchTutors(true)
      }
    }, [formData.company_id])

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Internship Title</Label>
          <Input
            id="title"
            value={formData.specifications.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                specifications: { ...formData.specifications, title: e.target.value },
              })
            }
            placeholder="Software Development Internship"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="student_id">Student</Label>
            <Select
              value={formData.student_id}
              onValueChange={(value) => setFormData({ ...formData, student_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.user_id} value={student.user_id.toString()}>
                    {student.user.first_name} {student.user.last_name} ({student.student_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="company_id">Company</Label>
            <Select
              value={formData.company_id}
              onValueChange={(value) => setFormData({ ...formData, company_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="industrial_tutor_id">Company Supervisor</Label>
          <Select
            value={formData.industrial_tutor_id}
            onValueChange={(value) => setFormData({ ...formData, industrial_tutor_id: value })}
            disabled={!formData.company_id || tutors.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={!formData.company_id ? "Select company first" : "Select supervisor"} />
            </SelectTrigger>
            <SelectContent>
              {tutors.map((tutor) => (
                <SelectItem key={tutor.user_id} value={tutor.user_id.toString()}>
                  {tutor.user.first_name} {tutor.user.last_name} - {tutor.job_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="internship_type">Type</Label>
            <Select
              value={formData.internship_type}
              onValueChange={(value) => setFormData({ ...formData, internship_type: value as "required" | "optional" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="required">Mandatory</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="objectives">Objectives</Label>
          <Textarea
            id="objectives"
            value={formData.specifications.objectives}
            onChange={(e) =>
              setFormData({
                ...formData,
                specifications: { ...formData.specifications, objectives: e.target.value },
              })
            }
            placeholder="Main objectives of the internship"
            rows={2}
            required
          />
        </div>

        <div>
          <Label htmlFor="main_tasks">Main Tasks</Label>
          <Textarea
            id="main_tasks"
            value={formData.specifications.main_tasks}
            onChange={(e) =>
              setFormData({
                ...formData,
                specifications: { ...formData.specifications, main_tasks: e.target.value },
              })
            }
            placeholder="Detailed description of tasks and responsibilities"
            rows={3}
            required
          />
        </div>

        <div>
          <Label htmlFor="student_profile">Student Profile</Label>
          <Textarea
            id="student_profile"
            value={formData.specifications.student_profile}
            onChange={(e) =>
              setFormData({
                ...formData,
                specifications: { ...formData.specifications, student_profile: e.target.value },
              })
            }
            placeholder="Required skills and qualifications"
            rows={2}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Internship
          </Button>
        </div>
      </form>
    )
  }

  const InternshipDetailsDialog = () => {
    if (!selectedInternship) return null

    const studentName = selectedInternship.student?.user
      ? `${selectedInternship.student.user.first_name} ${selectedInternship.student.user.last_name}`
      : "Unknown Student"

    const tutorName = selectedInternship.industrial_tutor?.user
      ? `${selectedInternship.industrial_tutor.user.first_name} ${selectedInternship.industrial_tutor.user.last_name}`
      : "Unknown Supervisor"

    return (
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{selectedInternship.title || "Internship Details"}</DialogTitle>
          <DialogDescription>Internship details and progress tracking</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Status</Label>
              <div className="mt-1">{getStatusBadge(selectedInternship.status)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Type</Label>
              <div className="mt-1">{getTypeBadge(selectedInternship.internship_type)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Duration</Label>
              <p className="text-sm">
                {new Date(selectedInternship.start_date).toLocaleDateString()} -{" "}
                {new Date(selectedInternship.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Student Information</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{studentName}</span>
                  </div>
                  <p className="text-sm text-gray-600">ID: {selectedInternship.student?.student_id || "N/A"}</p>
                  <p className="text-sm text-gray-600">
                    Department: {selectedInternship.academic_work?.department || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Academic Information</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Work Type: {selectedInternship.academic_work?.type || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Company Information</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{selectedInternship.company?.name || "Unknown Company"}</span>
                  </div>
                  <p className="text-sm text-gray-600">Supervisor: {tutorName}</p>
                  <p className="text-sm text-gray-600">
                    Position: {selectedInternship.industrial_tutor?.job_title || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Timeline</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Duration</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Start: {new Date(selectedInternship.start_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    End: {new Date(selectedInternship.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <RoleBasedWrapper allowedRoles={["admin", "teacher", "industrial_tutor"]}>
              <Button variant="outline">Edit Internship</Button>
            </RoleBasedWrapper>
            <Button>Generate Documents</Button>
          </div>
        </div>
      </DialogContent>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{userRole === "student" ? "My Internship" : "Internship Management"}</h2>
          <p className="text-gray-600">
            {userRole === "admin" && "Manage student internships and academic projects"}
            {userRole === "teacher" && "Manage internships under your supervision"}
            {userRole === "industrial_tutor" && "Manage internships at your company"}
            {userRole === "student" && "View your internship details and progress"}
          </p>
        </div>
        <RoleBasedWrapper allowedRoles={["admin", "teacher"]}>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Internship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Internship</DialogTitle>
                <DialogDescription>Set up a new internship assignment for a student</DialogDescription>
              </DialogHeader>
              <AddInternshipForm />
            </DialogContent>
          </Dialog>
        </RoleBasedWrapper>
      </div>

      {/* Filters - Hide for students since they only see their own internship */}
      {userRole !== "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, student, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="on_going">Active</SelectItem>
                  <SelectItem value="finished">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="required">Mandatory</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Internships Table */}
      <Card>
        <CardHeader>
          <CardTitle>{userRole === "student" ? "My Internship" : `Internships (${totalItems})`}</CardTitle>
          <CardDescription>
            {userRole === "admin" && "Active and completed internship assignments"}
            {userRole === "teacher" && "Internships under your supervision"}
            {userRole === "industrial_tutor" && "Internships at your company"}
            {userRole === "student" && "Your current and past internships"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : internships.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {userRole === "student" ? "No internships assigned to you yet" : "No internships found"}
            </div>
          ) : userRole === "student" ? (
            // Detailed view for students - show the first internship in detail
            <div className="space-y-6">
              {internships.map((internship) => {
                const studentName = internship.student?.user
                  ? `${internship.student.user.first_name} ${internship.student.user.last_name}`
                  : "Unknown Student"

                const tutorName = internship.industrial_tutor?.user
                  ? `${internship.industrial_tutor.user.first_name} ${internship.industrial_tutor.user.last_name}`
                  : "Unknown Supervisor"

                const startDate = new Date(internship.start_date).toLocaleDateString()
                const endDate = new Date(internship.end_date).toLocaleDateString()

                return (
                  <div key={internship.id} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
                        </CardHeader>
                        <CardContent>{getStatusBadge(internship.status)}</CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Type</CardTitle>
                        </CardHeader>
                        <CardContent>{getTypeBadge(internship.internship_type)}</CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">Duration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {startDate} - {endDate}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Building2 className="h-5 w-5 mr-2 text-gray-500" />
                            Company Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <h4 className="font-semibold">Company</h4>
                            <p>{internship.company?.name || "Unknown Company"}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Supervisor</h4>
                            <p>{tutorName}</p>
                            <p className="text-sm text-gray-500">{internship.industrial_tutor?.job_title || "N/A"}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                            Internship Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <h4 className="font-semibold">Title</h4>
                            <p>{internship.title || "Untitled Internship"}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Department</h4>
                            <p>{internship.academic_work?.department || "N/A"}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold">Work Type</h4>
                            <p>{internship.academic_work?.type || "N/A"}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => {
                          setSelectedInternship(internship)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        View Full Details
                      </Button>
                      <Button>Generate Documents</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Table view for other roles
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    {userRole !== "student" && <TableHead>Student</TableHead>}
                    <TableHead>Company</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internships.map((internship) => {
                    const studentName = internship.student?.user
                      ? `${internship.student.user.first_name} ${internship.student.user.last_name}`
                      : "Unknown Student"

                    const startDate = new Date(internship.start_date)
                    const endDate = new Date(internship.end_date)
                    const durationWeeks = Math.ceil(
                      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
                    )

                    return (
                      <TableRow key={internship.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{internship.title || "Untitled Internship"}</p>
                            <p className="text-sm text-gray-500">{internship.academic_work?.department || "N/A"}</p>
                          </div>
                        </TableCell>
                        {userRole !== "student" && (
                          <TableCell>
                            <div>
                              <p className="font-medium">{studentName}</p>
                              <p className="text-sm text-gray-500">{internship.student?.student_id || "N/A"}</p>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div>
                            <p className="font-medium">{internship.company?.name || "Unknown Company"}</p>
                            <p className="text-sm text-gray-500">
                              {internship.industrial_tutor?.user
                                ? `${internship.industrial_tutor.user.first_name} ${internship.industrial_tutor.user.last_name}`
                                : "Unknown Supervisor"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{durationWeeks}w</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(internship.internship_type)}</TableCell>
                        <TableCell>{getStatusBadge(internship.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInternship(internship)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <RoleBasedWrapper allowedRoles={["admin", "teacher", "industrial_tutor"]}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </RoleBasedWrapper>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination - Hide for students */}
              {userRole !== "student" && totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Internship Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <InternshipDetailsDialog />
      </Dialog>
    </div>
  )
}
