"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Edit, Eye, Building2, MapPin, Phone, Mail, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
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

interface Company {
  id: number
  name: string
  field: string
  address: string
  phone: string
  email: string
  website?: string
  description?: string
  created_at: string
  updated_at: string
  active_internships?: number
  total_internships?: number
}

export default function CompanyManagement() {
  const { user, userRole } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterField, setFilterField] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  const timeoutRef = useRef<number | null>(null)

  // Check if user has permission to access this component
  if (!permissions.canViewCompanies(userRole)) {
    return null // Hide the entire component
  }

  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError("")

      const filters = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        industry: filterField !== "all" ? filterField : "",
      }

      const response = await apiClient.getCompanies(filters)
      let filteredCompanies = Array.isArray(response.companies) ? response.companies : []

      // Role-based filtering - only admin and teachers can see companies
      // Industrial tutors should not see this component at all
      if (userRole === "teacher") {
        // Teachers might see companies they have partnerships with
        filteredCompanies = filteredCompanies.filter((company) => {
          // Add logic to filter companies based on teacher's partnerships
          return true // For now, teachers see all companies
        })
      }
      // Admin sees all companies (no filtering)

      setCompanies(filteredCompanies)
      setPagination((prev) => ({
        ...prev,
        total: filteredCompanies.length,
      }))
    } catch (err) {
      setError("Failed to load companies. Please try again.")
      console.error("Load companies error:", err)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [pagination.page, pagination.limit, userRole, searchTerm, filterField])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      loadCompanies()
    }, 300)

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchTerm, filterField])

  const getFieldBadge = (field: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-blue-100 text-blue-800",
      Finance: "bg-green-100 text-green-800",
      Healthcare: "bg-red-100 text-red-800",
      Education: "bg-purple-100 text-purple-800",
      Manufacturing: "bg-orange-100 text-orange-800",
      Consulting: "bg-gray-100 text-gray-800",
    }
    return (
      <Badge variant="outline" className={colors[field] || "bg-gray-100 text-gray-800"}>
        {field}
      </Badge>
    )
  }

  const AddCompanyForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      field: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      description: "",
    })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitting(true)

      try {
        await apiClient.createCompany(formData)
        setIsAddDialogOpen(false)
        loadCompanies()
        setFormData({
          name: "",
          field: "",
          address: "",
          phone: "",
          email: "",
          website: "",
          description: "",
        })
      } catch (error) {
        console.error("Create company error:", error)
        setError("Failed to create company. Please try again.")
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="TechCorp Inc."
              required
            />
          </div>
          <div>
            <Label htmlFor="field">Industry Field</Label>
            <Select value={formData.field} onValueChange={(value) => setFormData({ ...formData, field: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Business Street, Tunis, Tunisia"
            required
          />
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@techcorp.tn"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://www.techcorp.tn"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the company and its activities"
            rows={3}
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
              "Add Company"
            )}
          </Button>
        </div>
      </form>
    )
  }

  const CompanyDetailsDialog = () => {
    if (!selectedCompany) return null

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Company Details</DialogTitle>
          <DialogDescription>Complete information for {selectedCompany.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Industry</Label>
              <div className="mt-1">{getFieldBadge(selectedCompany.field)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Active Internships</Label>
              <p className="text-sm font-medium">{selectedCompany.active_internships || 0}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Address</Label>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{selectedCompany.address}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Contact Information</Label>
              <div className="space-y-2 mt-1">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedCompany.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{selectedCompany.email}</span>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Website</Label>
              <p className="text-sm mt-1">{selectedCompany.website || "Not provided"}</p>
            </div>
          </div>

          {selectedCompany.description && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Description</Label>
              <p className="text-sm mt-1">{selectedCompany.description}</p>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-gray-500">Registration Date</Label>
            <p className="text-sm">{new Date(selectedCompany.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    )
  }

  if (loading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading companies...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Company Management</h2>
          <p className="text-gray-600">
            {userRole === "admin" && "Manage company partnerships and internship opportunities"}
            {userRole === "teacher" && "View partner companies for student placements"}
          </p>
        </div>
        {permissions.canCreateCompanies(userRole) && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>Enter company information to create a new partnership</DialogDescription>
              </DialogHeader>
              <AddCompanyForm />
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
                  placeholder="Search by company name, field, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterField} onValueChange={setFilterField}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({pagination.total})</CardTitle>
          <CardDescription>
            {userRole === "admin" && "All registered company partners"}
            {userRole === "teacher" && "Available companies for student internships"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No companies found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Internships</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-gray-500">{company.website || "No website"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getFieldBadge(company.field)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{company.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {company.phone}
                        </div>
                        <div className="flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {company.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium text-green-600">{company.active_internships || 0}</p>
                        <p className="text-xs text-gray-500">Active</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCompany(company)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {permissions.canEditCompanies(userRole) && (
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
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} companies
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

      {/* Company Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <CompanyDetailsDialog />
      </Dialog>
    </div>
  )
}
