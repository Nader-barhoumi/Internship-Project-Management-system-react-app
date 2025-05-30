"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Edit, Eye, Mail, Phone, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { permissions } from "@/lib/permissions"
import RoleBasedWrapper from "@/components/role-based-wrapper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Student {
  id: number
  name: string
  email: string
  student_id: string
  degree_program: string
  academic_level: string
  phone?: string
  created_at: string
  updated_at: string
  supervisor_id?: number // For filtering by supervisor
  company_id?: number // For filtering by company
}

interface StudentCreateRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  cin: string
  student_id: string
  degree: string
  level: "1" | "2" | "3"
  sex?: "male" | "female"
}

export default function StudentManagement() {
  const { user, userRole } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")
  const [filterDegree, setFilterDegree] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  // Check if user has permission to access this component
  if (!permissions.canViewStudents(userRole)) {
    return null // Hide the entire component instead of showing access denied
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError("")

      const filters = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        level: filterLevel !== "all" ? filterLevel : "",
        degree: filterDegree !== "all" ? filterDegree : "",
      }

      const response = await apiClient.getStudents(filters)
      let filteredStudents = Array.isArray(response.students) ? response.students : []

      // Apply role-based data filtering
      if (userRole === "teacher") {
        // Teachers only see students they supervise or in their department
        filteredStudents = filteredStudents.filter((student) => {
          return (
            student.supervisor_id === user?.id || // Students they directly supervise
            student.degree_program === "Computer Science" || // Their department students
            student.degree_program === "Software Engineering"
          )
        })
      } else if (userRole === "industrial_tutor") {
        // Industrial tutors only see students assigned to their company
        filteredStudents = filteredStudents.filter((student) => {
          return (
            student.company_id === user?.company_id && // Students at their company
            (student.academic_level === "L3" || student.academic_level === "M2") // Only internship-eligible students
          )
        })
      } else if (userRole === "student") {
        // Students should not see this component at all, but just in case
        filteredStudents = []
      }
      // Admin sees all students (no filtering)

      setStudents(filteredStudents)
      setPagination((prev) => ({
        ...prev,
        total: filteredStudents.length,
      }))
    } catch (err) {
      setError("Failed to load students. Please try again.")
      console.error("Load students error:", err)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const loadStudentsRef = useRef(loadStudents)

  useEffect(() => {
    loadStudentsRef.current = loadStudents
  }, [loadStudents])

  useEffect(() => {
    loadStudentsRef.current()
  }, [pagination.page, pagination.limit, userRole, user?.id])

  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      loadStudentsRef.current()
    }, 300)

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchTerm, filterLevel, filterDegree])

  const getLevelBadge = (level: string) => {
    const levelLabels: Record<string, string> = {
      "1": "1st Year",
      "2": "2nd Year",
      "3": "3rd Year",
      L1: "L1",
      L2: "L2",
      L3: "L3",
      M1: "M1",
      M2: "M2",
    }
    return <Badge variant="outline">{levelLabels[level] || level}</Badge>
  }

  const AddStudentForm = () => {
    const [formData, setFormData] = useState<StudentCreateRequest>({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      cin: "",
      student_id: "",
      degree: "",
      level: "1",
      sex: undefined,
    })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitting(true)

      try {
        await apiClient.createStudent(formData)
        setIsAddDialogOpen(false)
        loadStudentsRef.current()
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          cin: "",
          student_id: "",
          degree: "",
          level: "1",
          sex: undefined,
        })
      } catch (error) {
        console.error("Create student error:", error)
        setError("Failed to create student. Please try again.")
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="John"
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@student.edu"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+216 12 345 678"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cin">CIN</Label>
            <Input
              id="cin"
              value={formData.cin}
              onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
              placeholder="12345678"
              maxLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="student_id">Student ID</Label>
            <Input
              id="student_id"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              placeholder="CS2024001"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="degree">Degree Program</Label>
            <Input
              id="degree"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              placeholder="Computer Science"
              required
            />
          </div>
          <div>
            <Label htmlFor="level">Academic Level</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData({ ...formData, level: value as "1" | "2" | "3" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="sex">Gender (Optional)</Label>
          <Select
            value={formData.sex || ""}
            onValueChange={(value) => setFormData({ ...formData, sex: value as "male" | "female" | undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Add Student"
            )}
          </Button>
        </div>
      </form>
    )
  }

  const StudentDetailsDialog = () => {
    if (!selectedStudent) return null

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>Complete information for {selectedStudent.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Student ID</Label>
              <p className="text-sm">{selectedStudent.student_id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Academic Level</Label>
              <div className="mt-1">{getLevelBadge(selectedStudent.academic_level)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Degree Program</Label>
              <p className="text-sm">{selectedStudent.degree_program}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Phone</Label>
              <p className="text-sm">{selectedStudent.phone || "Not provided"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{selectedStudent.email}</span>
            </div>
            {selectedStudent.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{selectedStudent.phone}</span>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
            <p className="text-sm">{new Date(selectedStudent.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    )
  }

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading students...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Management</h2>
          <p className="text-gray-600">
            {userRole === "admin" && "Manage all student records and academic progress"}
            {userRole === "teacher" && "View and manage students under your supervision"}
            {userRole === "industrial_tutor" && "View students assigned to your company"}
          </p>
        </div>
        <RoleBasedWrapper allowedRoles={["admin", "teacher"]}>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Enter student information to create a new record</DialogDescription>
              </DialogHeader>
              <AddStudentForm />
            </DialogContent>
          </Dialog>
        </RoleBasedWrapper>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Filters */}
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
                  placeholder="Search by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="L1">L1</SelectItem>
                <SelectItem value="L2">L2</SelectItem>
                <SelectItem value="L3">L3</SelectItem>
                <SelectItem value="M1">M1</SelectItem>
                <SelectItem value="M2">M2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({pagination.total})</CardTitle>
          <CardDescription>
            {userRole === "admin" && "Complete list of registered students"}
            {userRole === "teacher" && "Students under your supervision"}
            {userRole === "industrial_tutor" && "Students assigned to your company"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {userRole === "admin" && "No students found."}
                {userRole === "teacher" && "No students under your supervision."}
                {userRole === "industrial_tutor" && "No students assigned to your company."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Degree</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.student_id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.degree_program}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getLevelBadge(student.academic_level)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {student.email}
                        </div>
                        {student.phone && (
                          <div className="flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {student.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <RoleBasedWrapper allowedRoles={["admin", "teacher"]}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </RoleBasedWrapper>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <StudentDetailsDialog />
      </Dialog>
    </div>
  )
}
