"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { mockDataService } from "@/lib/mock-data"
import { toast } from "@/hooks/use-toast"

interface QuickActionDialogsProps {
  dialogs: {
    student: boolean
    company: boolean
    internship: boolean
    document: boolean
  }
  setDialogs: (dialogs: any) => void
  onSuccess: (type: string) => void
}

export default function QuickActionDialogs({ dialogs, setDialogs, onSuccess }: QuickActionDialogsProps) {
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsResponse = await mockDataService.getStudents({ page: 1, limit: 100 })
        const companiesResponse = await mockDataService.getCompanies({ page: 1, limit: 100 })
        setStudents(studentsResponse.data || [])
        setCompanies(companiesResponse.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        // Initialize with empty arrays if fetch fails
        setStudents([])
        setCompanies([])
      }
    }

    fetchData()
  }, [])

  const closeDialog = (type: string) => {
    setDialogs((prev: any) => ({ ...prev, [type]: false }))
  }

  const handleStudentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const studentData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      student_id: formData.get("student_id") as string,
      degree_program: formData.get("degree_program") as string,
      academic_level: formData.get("academic_level") as string,
      phone: formData.get("phone") as string,
    }

    try {
      await mockDataService.createStudent(studentData)
      toast({
        title: "Success",
        description: "Student added successfully!",
      })
      closeDialog("student")
      onSuccess("student")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompanySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const companyData = {
      name: formData.get("name") as string,
      industry: formData.get("industry") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      description: formData.get("description") as string,
    }

    try {
      await mockDataService.createCompany(companyData)
      toast({
        title: "Success",
        description: "Company added successfully!",
      })
      closeDialog("company")
      onSuccess("company")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInternshipSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const internshipData = {
      student_id: Number.parseInt(formData.get("student_id") as string),
      company_id: Number.parseInt(formData.get("company_id") as string),
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      status: "pending" as const,
    }

    try {
      await mockDataService.createInternship(internshipData)
      toast({
        title: "Success",
        description: "Internship created successfully!",
      })
      closeDialog("internship")
      onSuccess("internship")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create internship. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const documentType = formData.get("document_type") as string

    try {
      // Simulate document creation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Success",
        description: `${documentType} document created successfully!`,
      })
      closeDialog("document")
      onSuccess("document")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* New Student Dialog */}
      <Dialog open={dialogs.student} onOpenChange={() => closeDialog("student")}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Create a new student record with basic information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input id="student_id" name="student_id" placeholder="STU001" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="john@university.edu" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="+216 12 345 678" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="degree_program">Degree Program</Label>
                <Select name="degree_program" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                    <SelectItem value="Information Systems">Information Systems</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic_level">Academic Level</Label>
                <Select name="academic_level" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1">L1 (1st Year)</SelectItem>
                    <SelectItem value="L2">L2 (2nd Year)</SelectItem>
                    <SelectItem value="L3">L3 (3rd Year)</SelectItem>
                    <SelectItem value="M1">M1 (Master 1)</SelectItem>
                    <SelectItem value="M2">M2 (Master 2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => closeDialog("student")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Company Dialog */}
      <Dialog open={dialogs.company} onOpenChange={() => closeDialog("company")}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>Register a new company for internship partnerships.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input id="company_name" name="name" placeholder="TechCorp Inc." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select name="industry" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_email">Email</Label>
                <Input id="company_email" name="email" type="email" placeholder="contact@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_phone">Phone</Label>
                <Input id="company_phone" name="phone" placeholder="+216 71 123 456" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="123 Business St, Tunis" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Brief company description..." rows={3} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => closeDialog("company")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Company"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Internship Dialog */}
      <Dialog open={dialogs.internship} onOpenChange={() => closeDialog("internship")}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Internship</DialogTitle>
            <DialogDescription>Assign a student to an internship at a company.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInternshipSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Internship Title</Label>
              <Input id="title" name="title" placeholder="Software Development Internship" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student</Label>
                <Select name="student_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students && students.length > 0 ? (
                      students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} ({student.student_id})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        Loading students...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_id">Company</Label>
                <Select name="company_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies && companies.length > 0 ? (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        Loading companies...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Internship objectives and responsibilities..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => closeDialog("internship")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Internship"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Document Dialog */}
      <Dialog open={dialogs.document} onOpenChange={() => closeDialog("document")}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Document</DialogTitle>
            <DialogDescription>Generate a new document template for processing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDocumentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document_type">Document Type</Label>
              <Select name="document_type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internship Agreement">Internship Agreement</SelectItem>
                  <SelectItem value="Evaluation Form">Evaluation Form</SelectItem>
                  <SelectItem value="Completion Certificate">Completion Certificate</SelectItem>
                  <SelectItem value="Progress Report">Progress Report</SelectItem>
                  <SelectItem value="Final Report">Final Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_title">Document Title</Label>
              <Input id="document_title" name="title" placeholder="Document title..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_description">Description</Label>
              <Textarea
                id="document_description"
                name="description"
                placeholder="Document purpose and details..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => closeDialog("document")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Document"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
