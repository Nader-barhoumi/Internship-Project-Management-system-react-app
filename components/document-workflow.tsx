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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Eye, Download, FileText, PenTool, Scan, Bot } from "lucide-react"

interface Document {
  id: string
  title: string
  type: string
  studentId: string
  studentName: string
  internshipId?: string
  status: "draft" | "pending_signature" | "signed" | "validated" | "rejected"
  createdDate: string
  lastModified: string
  signatures: Signature[]
  content: string
  templateId: string
}

interface Signature {
  id: string
  signerName: string
  signerRole: "student" | "tutor" | "supervisor" | "admin"
  signedDate?: string
  status: "pending" | "signed" | "rejected"
  signatureImage?: string
}

interface DocumentTemplate {
  id: string
  name: string
  type: string
  content: string
  requiredSignatures: string[]
}

export default function DocumentWorkflow() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("documents")

  useEffect(() => {
    // Mock data
    const mockTemplates: DocumentTemplate[] = [
      {
        id: "TEMP001",
        name: "Internship Agreement",
        type: "internship_agreement",
        content: "Standard internship agreement template...",
        requiredSignatures: ["student", "tutor", "supervisor", "admin"],
      },
      {
        id: "TEMP002",
        name: "PFE Report Template",
        type: "pfe_report",
        content: "Academic project final report template...",
        requiredSignatures: ["student", "tutor"],
      },
      {
        id: "TEMP003",
        name: "Evaluation Form",
        type: "evaluation",
        content: "Student evaluation form template...",
        requiredSignatures: ["supervisor", "tutor"],
      },
    ]

    const mockDocuments: Document[] = [
      {
        id: "DOC001",
        title: "Internship Agreement - Alice Johnson",
        type: "internship_agreement",
        studentId: "CS2024001",
        studentName: "Alice Johnson",
        internshipId: "INT001",
        status: "pending_signature",
        createdDate: "2024-05-15",
        lastModified: "2024-05-16",
        content: "This internship agreement is between...",
        templateId: "TEMP001",
        signatures: [
          {
            id: "SIG001",
            signerName: "Alice Johnson",
            signerRole: "student",
            status: "signed",
            signedDate: "2024-05-15",
          },
          { id: "SIG002", signerName: "Dr. Sarah Wilson", signerRole: "tutor", status: "pending" },
          { id: "SIG003", signerName: "John Smith", signerRole: "supervisor", status: "pending" },
          { id: "SIG004", signerName: "Admin Office", signerRole: "admin", status: "pending" },
        ],
      },
      {
        id: "DOC002",
        title: "PFE Report - Bob Smith",
        type: "pfe_report",
        studentId: "EE2024002",
        studentName: "Bob Smith",
        status: "draft",
        createdDate: "2024-05-10",
        lastModified: "2024-05-18",
        content: "Project final report content...",
        templateId: "TEMP002",
        signatures: [
          { id: "SIG005", signerName: "Bob Smith", signerRole: "student", status: "pending" },
          { id: "SIG006", signerName: "Prof. Michael Brown", signerRole: "tutor", status: "pending" },
        ],
      },
      {
        id: "DOC003",
        title: "Evaluation Form - Carol Davis",
        type: "evaluation",
        studentId: "ME2024003",
        studentName: "Carol Davis",
        status: "validated",
        createdDate: "2024-04-20",
        lastModified: "2024-04-25",
        content: "Student evaluation completed...",
        templateId: "TEMP003",
        signatures: [
          {
            id: "SIG007",
            signerName: "David Lee",
            signerRole: "supervisor",
            status: "signed",
            signedDate: "2024-04-22",
          },
          {
            id: "SIG008",
            signerName: "Dr. Jennifer Taylor",
            signerRole: "tutor",
            status: "signed",
            signedDate: "2024-04-24",
          },
        ],
      },
    ]

    setTemplates(mockTemplates)
    setDocuments(mockDocuments)
  }, [])

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus
    const matchesType = filterType === "all" || doc.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: "secondary",
      pending_signature: "secondary",
      signed: "default",
      validated: "default",
      rejected: "destructive",
    }
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      pending_signature: "bg-yellow-100 text-yellow-800",
      signed: "bg-blue-100 text-blue-800",
      validated: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }
    return (
      <Badge variant={variants[status] || "outline"} className={colors[status]}>
        {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
      </Badge>
    )
  }

  const CreateDocumentForm = () => {
    const [formData, setFormData] = useState({
      title: "",
      templateId: "",
      studentId: "",
      internshipId: "",
      content: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const selectedTemplate = templates.find((t) => t.id === formData.templateId)
      if (!selectedTemplate) return

      const newDocument: Document = {
        id: `DOC${Date.now()}`,
        ...formData,
        type: selectedTemplate.type,
        studentName: "Student Name", // Would be fetched based on studentId
        status: "draft",
        createdDate: new Date().toISOString().split("T")[0],
        lastModified: new Date().toISOString().split("T")[0],
        signatures: selectedTemplate.requiredSignatures.map((role, index) => ({
          id: `SIG${Date.now()}_${index}`,
          signerName: `${role} Name`,
          signerRole: role as any,
          status: "pending",
        })),
      }
      setDocuments([...documents, newDocument])
      setIsCreateDialogOpen(false)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Document Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Internship Agreement - Student Name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="templateId">Document Template</Label>
            <Select
              value={formData.templateId}
              onValueChange={(value) => setFormData({ ...formData, templateId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="CS2024001"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="internshipId">Internship ID (Optional)</Label>
          <Input
            id="internshipId"
            value={formData.internshipId}
            onChange={(e) => setFormData({ ...formData, internshipId: e.target.value })}
            placeholder="INT001"
          />
        </div>

        <div>
          <Label htmlFor="content">Document Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Document content will be generated from template..."
            rows={6}
          />
          <div className="flex space-x-2 mt-2">
            <Button type="button" variant="outline" size="sm">
              <Bot className="h-4 w-4 mr-2" />
              AI Suggestions
            </Button>
            <Button type="button" variant="outline" size="sm">
              <Scan className="h-4 w-4 mr-2" />
              OCR Scan
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Create Document</Button>
        </div>
      </form>
    )
  }

  const DocumentDetailsDialog = () => {
    if (!selectedDocument) return null

    return (
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{selectedDocument.title}</DialogTitle>
          <DialogDescription>Document details and signature tracking</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Status</Label>
              <div className="mt-1">{getStatusBadge(selectedDocument.status)}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Type</Label>
              <p className="text-sm">{selectedDocument.type.replace("_", " ")}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Created</Label>
              <p className="text-sm">{new Date(selectedDocument.createdDate).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Last Modified</Label>
              <p className="text-sm">{new Date(selectedDocument.lastModified).toLocaleDateString()}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Signature Progress</Label>
            <div className="mt-2 space-y-2">
              {selectedDocument.signatures.map((signature) => (
                <div key={signature.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        signature.status === "signed"
                          ? "bg-green-500"
                          : signature.status === "rejected"
                            ? "bg-red-500"
                            : "bg-gray-300"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{signature.signerName}</p>
                      <p className="text-sm text-gray-500 capitalize">{signature.signerRole.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {signature.signedDate && (
                      <span className="text-sm text-gray-500">
                        {new Date(signature.signedDate).toLocaleDateString()}
                      </span>
                    )}
                    <Badge
                      variant={
                        signature.status === "signed"
                          ? "default"
                          : signature.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {signature.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Document Content</Label>
            <div className="mt-2 p-4 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{selectedDocument.content}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Document
            </Button>
            <Button onClick={() => setIsSignatureDialogOpen(true)}>
              <PenTool className="h-4 w-4 mr-2" />
              Add Signature
            </Button>
          </div>
        </div>
      </DialogContent>
    )
  }

  const SignatureDialog = () => {
    const [signatureFile, setSignatureFile] = useState<File | null>(null)
    const [signerRole, setSignerRole] = useState("")

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setSignatureFile(e.target.files[0])
      }
    }

    const handleSubmitSignature = () => {
      if (!selectedDocument || !signatureFile || !signerRole) return

      // Update document with signature
      const updatedDocument = { ...selectedDocument }
      const signatureIndex = updatedDocument.signatures.findIndex((s) => s.signerRole === signerRole)
      if (signatureIndex !== -1) {
        updatedDocument.signatures[signatureIndex] = {
          ...updatedDocument.signatures[signatureIndex],
          status: "signed",
          signedDate: new Date().toISOString().split("T")[0],
          signatureImage: URL.createObjectURL(signatureFile),
        }
      }

      // Check if all signatures are complete
      const allSigned = updatedDocument.signatures.every((s) => s.status === "signed")
      if (allSigned) {
        updatedDocument.status = "signed"
      }

      setDocuments(documents.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc)))
      setIsSignatureDialogOpen(false)
      setSignatureFile(null)
      setSignerRole("")
    }

    return (
      <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Electronic Signature</DialogTitle>
            <DialogDescription>Upload your handwritten signature image</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="signerRole">Your Role</Label>
              <Select value={signerRole} onValueChange={setSignerRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="tutor">Academic Tutor</SelectItem>
                  <SelectItem value="supervisor">Company Supervisor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="signature">Signature Image</Label>
              <Input id="signature" type="file" accept="image/*" onChange={handleSignatureUpload} className="mt-1" />
              <p className="text-sm text-gray-500 mt-1">
                Upload a clear image of your handwritten signature (PNG, JPG)
              </p>
            </div>

            {signatureFile && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-500">Preview</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <img
                    src={URL.createObjectURL(signatureFile) || "/placeholder.svg"}
                    alt="Signature preview"
                    className="max-h-20 mx-auto"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSignatureDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitSignature} disabled={!signatureFile || !signerRole}>
                Submit Signature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const TemplateManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Document Templates</h3>
          <p className="text-gray-600">Manage document templates and formats</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription>{template.type.replace("_", " ")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Required Signatures</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.requiredSignatures.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Document Workflow</h2>
          <p className="text-gray-600">Manage documents, signatures, and templates</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
              <DialogDescription>Generate a new document from template</DialogDescription>
            </DialogHeader>
            <CreateDocumentForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
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
                      placeholder="Search by title or student name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_signature">Pending Signature</SelectItem>
                    <SelectItem value="signed">Signed</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="internship_agreement">Internship Agreement</SelectItem>
                    <SelectItem value="pfe_report">PFE Report</SelectItem>
                    <SelectItem value="evaluation">Evaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
              <CardDescription>All documents and their signature status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signatures</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{document.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{document.studentName}</p>
                          <p className="text-sm text-gray-500">{document.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{document.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(document.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">
                            {document.signatures.filter((s) => s.status === "signed").length}/
                            {document.signatures.length}
                          </span>
                          <div className="flex space-x-1">
                            {document.signatures.map((sig, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  sig.status === "signed"
                                    ? "bg-green-500"
                                    : sig.status === "rejected"
                                      ? "bg-red-500"
                                      : "bg-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(document.lastModified).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDocument(document)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManagement />
        </TabsContent>
      </Tabs>

      {/* Document Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DocumentDetailsDialog />
      </Dialog>

      {/* Signature Dialog */}
      <SignatureDialog />
    </div>
  )
}
