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
import { Plus, Search, Filter, Edit, Eye, Mail, Phone, Loader2, GraduationCap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { permissions } from "@/lib/permissions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AcademicStaff {
  id: number
  name: string
  email: string
  phone: string
  department: string
  position: string
  specialization: string
  office: string
  created_at: string
  updated_at: string
  supervised_students?: number
  active_projects?: number
}

export default function AcademicStaffManagement() {
  const { user, userRole } = useAuth()
  const [staff, setStaff] = useState<AcademicStaff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterPosition, setFilterPosition] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<AcademicStaff | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  // Check if user has permission to access this component
  if (!permissions.canViewAcademicStaff(userRole)) {
    return null // Hide the entire component - only admins can see this
  }

  const loadStaff = async () => {
    try {
      setLoading(true)
      setError("")

      // Mock data for academic staff - in real app, this would come from API
      const mockStaff: AcademicStaff[] = [
        {
          id: 1,
          name: "Dr. Ahmed Ben Ali",
          email: "ahmed.benali@university.tn",
          phone: "+216 71 123 456",
          department: "Computer Science",
          position: "Professor",
          specialization: "Artificial Intelligence",
          office: "CS-201",
          created_at: "2023-01-15",
          updated_at: "2024-01-15",
          supervised_students: 12,
          active_projects: 3,
        },
        {
          id: 2,
          name: "Dr. Fatma Gharbi",
          email: "fatma.gharbi@university.tn",
          phone: "+216 71 234 567",
          department: "Software Engineering",
          position: "Associate Professor",
          specialization: "Software Architecture",
          office: "SE-105",
          created_at: "2023-02-20",
          updated_at: "2024-01-10",
          supervised_students: 8,
          active_projects: 2,
        },
        {
          id: 3,
          name: "Dr. Mohamed Trabelsi",
          email: "mohamed.trabelsi@university.tn",
          phone: "+216 71 345 678",
          department: "Computer Science",
          position: "Assistant Professor",
          specialization: "Database Systems",
          office: "CS-150",
          created_at: "2023-03-10",
          updated_at: "2024-01-05",
          supervised_students: 6,
          active_projects: 1,
        },
      ]

      // Apply filters
      const filteredStaff = mockStaff.filter((member) => {
        const matchesSearch =
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.specialization.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment
        const matchesPosition = filterPosition === "all" || member.position === filterPosition

        return matchesSearch && matchesDepartment && matchesPosition
      })

      setStaff(filteredStaff)
      setPagination((prev) => ({
        ...prev,
        total: filteredStaff.length,
      }))
    } catch (err) {
      setError("Failed to load academic staff. Please try again.")
      console.error("Load staff error:", err)
      setStaff([])
    } finally {
      setLoading(false)
    }
  }

  const timeoutRef = useRef<number | null>(null)
  const loadStaffRef = useRef(loadStaff)

  useEffect(() => {
    loadStaffRef.current = loadStaff
  }, [loadStaff])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      loadStaffRef.current()
    }, 300)

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchTerm, filterDepartment, filterPosition])

  useEffect(() => {
    loadStaff()
  }, [pagination.page, pagination.limit, userRole])

  const getPositionBadge = (position: string) => {
    const colors: Record<string, string> = {
      Professor: "bg-purple-100 text-purple-800",
      "Associate Professor": "bg-blue-100 text-blue-800",
      "Assistant Professor": "bg-green-100 text-green-800",
      Lecturer: "bg-orange-100 text-orange-800",
    }
    return (
      <Badge variant="outline" className={colors[position] || "bg-gray-100 text-gray-800"}>
        {position}
      </Badge>
    )
  }

  const AddStaffForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      specialization: "",
      office: "",
    })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitting(true)

      try {
        // In real app, this would call API
        console.log("Creating staff member:", formData)
        setIsAddDialogOpen(false)
        loadStaff()
        setFormData({
          name: "",
          email: "",
          phone: "",
          department: "",
          position: "",
          specialization: "",
          office: "",
        })
      } catch (error) {
        console.error("Create staff error:", error)
        setError("Failed to create staff member. Please try again.")
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. John Doe"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@university.tn"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+216 71 123 456"
              required
            />
          </div>
          <div>
            <Label htmlFor="office">Office</Label>
            <Input
              id="office"
              value={formData.office}
              onChange={(e) => setFormData({ ...formData, office: e.target.value })}
              placeholder="CS-201"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                <SelectItem value="Information Systems">Information Systems</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="position">Position</Label>
            <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professor">Professor</SelectItem>
                <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                <SelectItem value="Lecturer">Lecturer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="Artificial Intelligence, Database Systems, etc."
            required
          />
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
              "Add Staff Member"
            )}
          </Button>
        </div>
      </form>
    )
  }

  const StaffDetailsDialog = () => {
    if (!selectedStaff) return null

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Staff Member Details</DialogTitle>
          <DialogDescription>Complete information for {selectedStaff.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Department</Label>
              <p className="text-sm">{selectedStaff.department}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Position</Label>
              <div className="mt-1">{getPositionBadge(selectedStaff.position)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Specialization</Label>
              <p className="text-sm">{selectedStaff.specialization}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Office</Label>
              <p className="text-sm">{selectedStaff.office}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{selectedStaff.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{selectedStaff.phone}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Supervised Students</Label>
              <p className="text-sm font-medium text-blue-600">{selectedStaff.supervised_students || 0}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Active Projects</Label>
              <p className="text-sm font-medium text-green-600">{selectedStaff.active_projects || 0}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Joined Date</Label>
            <p className="text-sm">{new Date(selectedStaff.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    )
  }

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading academic staff...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Academic Staff Management</h2>
          <p className="text-gray-600">Manage faculty members and academic supervisors</p>
        </div>
        {permissions.canCreateAcademicStaff(userRole) && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>Enter academic staff information</DialogDescription>
              </DialogHeader>
              <AddStaffForm />
            </DialogContent>
          </Dialog>
        )}
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
                  placeholder="Search by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                <SelectItem value="Information Systems">Information Systems</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPosition} onValueChange={setFilterPosition}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="Professor">Professor</SelectItem>
                <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                <SelectItem value="Lecturer">Lecturer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Staff ({pagination.total})</CardTitle>
          <CardDescription>Faculty members and academic supervisors</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No staff members found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.office}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{member.department}</p>
                    </TableCell>
                    <TableCell>{getPositionBadge(member.position)}</TableCell>
                    <TableCell>
                      <p className="text-sm">{member.specialization}</p>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {member.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium text-blue-600">{member.supervised_students || 0}</p>
                        <p className="text-xs text-gray-500">Supervised</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStaff(member)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {permissions.canEditAcademicStaff(userRole) && (
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
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
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} staff members
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

      {/* Staff Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <StaffDetailsDialog />
      </Dialog>
    </div>
  )
}
