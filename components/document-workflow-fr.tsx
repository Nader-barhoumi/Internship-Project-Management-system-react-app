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
import { Plus, Search, Edit, Eye, Download, FileText, PenTool } from "lucide-react"

import AIDocumentAssistant from "./ai-document-assistant"
import OCRScanner from "./ocr-scanner"
import PDFViewer from "./pdf-viewer"

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

export default function DocumentWorkflowFr() {
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
    // Données fictives
    const mockTemplates: DocumentTemplate[] = [
      {
        id: "TEMP001",
        name: "Convention de Stage",
        type: "internship_agreement",
        content: "Modèle standard de convention de stage...",
        requiredSignatures: ["student", "tutor", "supervisor", "admin"],
      },
      {
        id: "TEMP002",
        name: "Modèle de Rapport PFE",
        type: "pfe_report",
        content: "Modèle de rapport final de projet académique...",
        requiredSignatures: ["student", "tutor"],
      },
      {
        id: "TEMP003",
        name: "Formulaire d'Évaluation",
        type: "evaluation",
        content: "Modèle de formulaire d'évaluation étudiant...",
        requiredSignatures: ["supervisor", "tutor"],
      },
    ]

    const mockDocuments: Document[] = [
      {
        id: "DOC001",
        title: "Convention de Stage - Alice Johnson",
        type: "internship_agreement",
        studentId: "CS2024001",
        studentName: "Alice Johnson",
        internshipId: "INT001",
        status: "pending_signature",
        createdDate: "2024-05-15",
        lastModified: "2024-05-16",
        content: "Cette convention de stage est établie entre...",
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
          { id: "SIG004", signerName: "Bureau Administratif", signerRole: "admin", status: "pending" },
        ],
      },
      {
        id: "DOC002",
        title: "Rapport PFE - Bob Smith",
        type: "pfe_report",
        studentId: "EE2024002",
        studentName: "Bob Smith",
        status: "draft",
        createdDate: "2024-05-10",
        lastModified: "2024-05-18",
        content: "Contenu du rapport final de projet...",
        templateId: "TEMP002",
        signatures: [
          { id: "SIG005", signerName: "Bob Smith", signerRole: "student", status: "pending" },
          { id: "SIG006", signerName: "Prof. Michael Brown", signerRole: "tutor", status: "pending" },
        ],
      },
      {
        id: "DOC003",
        title: "Formulaire d'Évaluation - Carol Davis",
        type: "evaluation",
        studentId: "ME2024003",
        studentName: "Carol Davis",
        status: "validated",
        createdDate: "2024-04-20",
        lastModified: "2024-04-25",
        content: "Évaluation de l'étudiant complétée...",
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
    
    let statusText = ""
    switch(status) {
      case "draft": 
        statusText = "Brouillon"; 
        break;
      case "pending_signature": 
        statusText = "En attente de signature"; 
        break;
      case "signed": 
        statusText = "Signé"; 
        break;
      case "validated": 
        statusText = "Validé"; 
        break;
      case "rejected": 
        statusText = "Rejeté"; 
        break;
      default: 
        statusText = status.replace("_", " ");
    }
    
    return (
      <Badge variant={variants[status] || "outline"} className={colors[status]}>
        {statusText}
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

    const selectedTemplate = templates.find((t) => t.id === formData.templateId)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const selectedTemplate = templates.find((t) => t.id === formData.templateId)
      if (!selectedTemplate) return

      const newDocument: Document = {
        id: `DOC${Date.now()}`,
        ...formData,
        type: selectedTemplate.type,
        studentName: "Nom de l'Étudiant", // Serait récupéré en fonction de studentId
        status: "draft",
        createdDate: new Date().toISOString().split("T")[0],
        lastModified: new Date().toISOString().split("T")[0],
        signatures: selectedTemplate.requiredSignatures.map((role, index) => {
          let signerName = "";
          switch(role) {
            case "student": signerName = "Nom de l'étudiant"; break;
            case "tutor": signerName = "Nom du tuteur"; break;
            case "supervisor": signerName = "Nom du superviseur"; break;
            case "admin": signerName = "Administration"; break;
            default: signerName = `Nom du ${role}`;
          }
          
          return {
            id: `SIG${Date.now()}_${index}`,
            signerName: signerName,
            signerRole: role as any,
            status: "pending",
          }
        }),
      }
      setDocuments([...documents, newDocument])
      setIsCreateDialogOpen(false)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Titre du Document</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Convention de Stage - Nom de l'Étudiant"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="templateId">Modèle de Document</Label>
            <Select
              value={formData.templateId}
              onValueChange={(value) => setFormData({ ...formData, templateId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un modèle" />
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
            <Label htmlFor="studentId">ID Étudiant</Label>
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
          <Label htmlFor="internshipId">ID Stage (Optionnel)</Label>
          <Input
            id="internshipId"
            value={formData.internshipId}
            onChange={(e) => setFormData({ ...formData, internshipId: e.target.value })}
            placeholder="INT001"
          />
        </div>

        <div>
          <Label htmlFor="content">Contenu du Document</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Le contenu du document sera généré à partir du modèle..."
            rows={6}
          />
          <div className="mt-4 space-y-4">
            {/* Assistant IA */}
            <AIDocumentAssistant
              documentType={selectedTemplate?.type || ""}
              currentContent={formData.content}
              onContentUpdate={(content) => setFormData({ ...formData, content })}
              onSuggestionApply={(suggestion) => {
                // Appliquer la suggestion de l'IA au contenu
                const updatedContent = formData.content + "\n\n" + suggestion.suggestion
                setFormData({ ...formData, content: updatedContent })
              }}
            />

            {/* Scanner OCR */}
            <OCRScanner
              onTextExtracted={(text) => {
                const updatedContent = formData.content + "\n\n" + text
                setFormData({ ...formData, content: updatedContent })
              }}
              onError={(error) => console.error("Erreur OCR:", error)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Annuler
          </Button>
          <Button type="submit">Créer le Document</Button>
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
          <DialogDescription>Détails du document et suivi des signatures</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="signatures">Signatures</TabsTrigger>
              <TabsTrigger value="preview">Aperçu PDF</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {/* Contenu des détails existants */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedDocument.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <p className="text-sm">
                    {selectedDocument.type === "internship_agreement" 
                      ? "Convention de stage" 
                      : selectedDocument.type === "pfe_report" 
                        ? "Rapport PFE" 
                        : selectedDocument.type === "evaluation" 
                          ? "Évaluation" 
                          : selectedDocument.type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Créé le</Label>
                  <p className="text-sm">{new Intl.DateTimeFormat('fr-FR').format(new Date(selectedDocument.createdDate))}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dernière Modification</Label>
                  <p className="text-sm">{new Intl.DateTimeFormat('fr-FR').format(new Date(selectedDocument.lastModified))}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Contenu du Document</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{selectedDocument.content}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signatures" className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Progression des Signatures</Label>
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
                          <p className="text-sm text-gray-500 capitalize">
                            {signature.signerRole === "student" ? "Étudiant" :
                             signature.signerRole === "tutor" ? "Tuteur académique" :
                             signature.signerRole === "supervisor" ? "Superviseur entreprise" :
                             signature.signerRole === "admin" ? "Administration" :
                             (signature.signerRole as string).replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {signature.signedDate && (
                          <span className="text-sm text-gray-500">
                            {new Intl.DateTimeFormat('fr-FR').format(new Date(signature.signedDate))}
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
                          {signature.status === "signed" ? "signé" : 
                           signature.status === "rejected" ? "rejeté" : 
                           "en attente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <PDFViewer
                file={`/placeholder.pdf`} // En production, ce serait l'URL réelle du PDF
                onError={(error) => console.error("Erreur PDF:", error)}
                onLoadSuccess={(numPages) => console.log(`PDF chargé avec ${numPages} pages`)}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Modifier Document
            </Button>
            <Button onClick={() => setIsSignatureDialogOpen(true)}>
              <PenTool className="h-4 w-4 mr-2" />
              Ajouter Signature
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

      // Mettre à jour le document avec la signature
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

      // Vérifier si toutes les signatures sont complètes
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
            <DialogTitle>Ajouter une Signature Électronique</DialogTitle>
            <DialogDescription>Téléchargez l'image de votre signature manuscrite</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="signerRole">Votre Rôle</Label>
              <Select value={signerRole} onValueChange={setSignerRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Étudiant</SelectItem>
                  <SelectItem value="tutor">Tuteur Académique</SelectItem>
                  <SelectItem value="supervisor">Superviseur Entreprise</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="signature">Image de Signature</Label>
              <Input id="signature" type="file" accept="image/*" onChange={handleSignatureUpload} className="mt-1" />
              <p className="text-sm text-gray-500 mt-1">
                Téléchargez une image claire de votre signature manuscrite (PNG, JPG)
              </p>
            </div>

            {signatureFile && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-500">Aperçu</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <img
                    src={URL.createObjectURL(signatureFile) || "/placeholder.svg"}
                    alt="Aperçu de la signature"
                    className="max-h-20 mx-auto"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSignatureDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmitSignature} disabled={!signatureFile || !signerRole}>
                Soumettre la Signature
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
          <h3 className="text-lg font-semibold">Modèles de Documents</h3>
          <p className="text-gray-600">Gérer les modèles et formats de documents</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Modèle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription>
                {template.type === "internship_agreement" ? "Convention de stage" : 
                 template.type === "pfe_report" ? "Rapport PFE" : 
                 template.type === "evaluation" ? "Évaluation" : 
                 template.type.replace("_", " ")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Signatures Requises</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.requiredSignatures.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role === "student" ? "étudiant" : 
                         role === "tutor" ? "tuteur" : 
                         role === "supervisor" ? "superviseur" : 
                         role === "admin" ? "admin" : 
                         role.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Aperçu
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
          <h2 className="text-2xl font-bold">Flux de Documents</h2>
          <p className="text-gray-600">Gérer les documents, signatures et modèles</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Document</DialogTitle>
              <DialogDescription>Générer un nouveau document à partir d'un modèle</DialogDescription>
            </DialogHeader>
            <CreateDocumentForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle>Recherche & Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par titre ou nom d'étudiant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les Statuts</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="pending_signature">En Attente de Signature</SelectItem>
                    <SelectItem value="signed">Signé</SelectItem>
                    <SelectItem value="validated">Validé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les Types</SelectItem>
                    <SelectItem value="internship_agreement">Convention de Stage</SelectItem>
                    <SelectItem value="pfe_report">Rapport PFE</SelectItem>
                    <SelectItem value="evaluation">Évaluation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
              <CardDescription>Tous les documents et leur état de signature</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Signatures</TableHead>
                    <TableHead>Dernière Modification</TableHead>
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
                        <Badge variant="outline">
                          {document.type === "internship_agreement" ? "Convention de stage" : 
                           document.type === "pfe_report" ? "Rapport PFE" : 
                           document.type === "evaluation" ? "Évaluation" : 
                           document.type.replace("_", " ")}
                        </Badge>
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
                      <TableCell>{new Intl.DateTimeFormat('fr-FR').format(new Date(document.lastModified))}</TableCell>
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

      {/* Dialogue de Détails du Document */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DocumentDetailsDialog />
      </Dialog>

      {/* Dialogue de Signature */}
      <SignatureDialog />
    </div>
  )
}
